<template>
  <v-container fluid>
    <v-card>
      <v-toolbar
        dense
        flat
        color="primary"
        dark
      >
        <v-toolbar-title>일기장</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="editMode = !editMode"
        >
          <v-icon>{{ editMode ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-text-field
          v-model="form.title"
          label="제목"
        />
        <v-text-field
          v-model="form.content"
          label="내용"
        />
        <Editor
          v-if="editMode"
          ref="toastEditor"
        />
        <Viewer
          v-else
          ref="toastViewer"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="fileImport">
          fileImport
        </v-btn>
        <v-btn @click="fileExport">
          fileExport
        </v-btn>
        <v-btn @click="dbRead">
          Read
        </v-btn>
        <v-btn @click="dbWrite">
          Write
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import { Editor, Viewer } from '@toast-ui/vue-editor'
const { dialog } = require('@electron/remote')
const fs = require('fs')
const Datastore = require('nedb-promises')
const db = Datastore.create('/path/to/db.db')

const options = {
  filters: [
    {
      name: 'text and markdown',
      extensions: ['text', 'md']
    }
  ]
}
export default {
  components: {
    Editor,
    Viewer
  },
  data () {
    return {
      editMode: true,
      form: {
        title: '',
        content: ''
      }
    }
  },
  methods: {
    fileImport () {
      const r = dialog.showOpenDialogSync(options)
      if (!r) return
      const text = fs.readFileSync(r[0]).toString()
      // this.$refs.toastEditor.invoke('setMarkdown', text)
      if (this.editMode) {
        this.$refs.toastEditor.invoke('setMarkdown', text)
      } else {
        this.$refs.toastViewer.invoke('setMarkdown', text)
      }
      this.form.content = text
    },
    fileExport () {
      const r = dialog.showSaveDialogSync(options)
      if (!r) return
      let text
      if (this.editMode) {
        text = this.$refs.toastEditor.invoke('getMarkdown')
      } else {
        text = this.$refs.toastViewer.invoke('getMarkdown')
      }
      console.log(text)
      fs.writeFileSync(r, this.form.content)
    },
    async dbRead () {
      const rs = await db.find()
      console.log(rs)
    },
    async dbWrite () {
      const r = await db.insert(this.form)
      console.log(r)
    }
  }
}
</script>
