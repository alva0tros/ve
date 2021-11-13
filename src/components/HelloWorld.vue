<template>
  <v-container fluid>
    <v-card>
      <v-toolbar
        dense
        flat
        color="primary"
        dark
      >
        <v-toolbar-title>문서편집기</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="editMode = !editMode"
        >
          <v-icon>{{ editMode ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
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
        <v-btn @click="read">
          read
        </v-btn>
        <v-btn @click="write">
          write
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
      editMode: true
    }
  },
  methods: {
    read () {
      const r = dialog.showOpenDialogSync(options)
      if (!r) return
      const text = fs.readFileSync(r[0]).toString()
      // this.$refs.toastEditor.invoke('setMarkdown', text)
      if (this.editMode) {
        this.$refs.toastEditor.invoke('setMarkdown', text)
      } else {
        this.$refs.toastViewer.invoke('setMarkdown', text)
      }
    },
    write () {
      const r = dialog.showSaveDialogSync(options)
      if (!r) return
      let text
      if (this.editMode) {
        text = this.$refs.toastEditor.invoke('getMarkdown')
      } else {
        text = this.$refs.toastViewer.invoke('getMarkdown')
      }
      fs.writeFileSync(r, text)
    }
  }
}
</script>
