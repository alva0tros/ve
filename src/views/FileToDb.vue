<template>
  <v-container fluid>
    <v-card>
      <v-toolbar
        dense
        flat
        color="primary"
        dark
      >
        <v-toolbar-title>파일 목록</v-toolbar-title>
        <v-spacer />
        <v-text-field
          v-model="search"
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          label="Search"
        />
        <v-btn
          icon
          @click="read()"
        >
          <v-icon>mdi-read</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="fetch()"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="items"
        :search="search"
      >
        <template v-slot:[`item.name`]="{ item }">
          <v-btn @click="execute(item)">
            {{ item.name.substr(0, 20) }}
          </v-btn>
        </template>
        <template v-slot:[`item.size`]="{ item }">
          {{ byte(item.size) }}
        </template>
        <template v-slot:[`item.time`]="{ item }">
          {{ new Date(item.time).toLocaleString() }}
        </template>
        <template v-slot:[`item.tags`]="{ item }">
          <v-chip
            v-for="tag in item.tags"
            :key="tag"
            close
            @click:close="delTag(item, tag)"
          >
            {{ tag }}
          </v-chip>
          <v-btn
            icon
            @click="openDialog(item)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <template v-slot:[`item.rating`]="{ item }">
          <v-rating
            v-model="item.rating"
            @input="ratingChange(item)"
          />
        </template>
        <template v-slot:[`item._id`]="{ item }">
          <v-btn
            icon
            color="error"
            @click="del(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog
      v-model="dialog"
      width="300"
    >
      <v-card v-if="selectedItem">
        <v-card-title>
          tag modify
        </v-card-title>
        <v-card-text>
          <v-combobox
            v-model="selectedItem.tags"
            :items="tags"
            multiple
            chips
            @change="changeTag"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
const { shell } = require('electron')
const { dialog } = require('@electron/remote')
const byte = require('bytes')
const fs = require('fs')
const path = require('path')

const Datastore = require('nedb-promises')
const DbFile = Datastore.create('dbFiles.db')

export default {
  data () {
    return {
      dir: '',
      byte,
      headers: [
        { value: 'name', text: 'name' },
        // { value: 'path', text: 'path' },
        { value: 'time', text: 'time' },
        { value: 'size', text: 'size' },
        { value: 'tags', text: 'tags' },
        { value: 'rating', text: 'ratings' },
        { value: '_id', text: 'actions' }
      ],
      items: [],
      dialog: false,
      selectedItem: null,
      tags: [],
      search: ''
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    async fetch () {
      this.items = await DbFile.find()
      this.addTag()
    },
    async read () {
      const rs = dialog.showOpenDialogSync({
        properties: ['openDirectory']
      })
      if (!rs) return
      this.dir = rs[0]
      const files = fs.readdirSync(this.dir)
      if (!files.length) return
      for (const v of files) {
        const p = path.join(this.dir, v)
        const stat = fs.statSync(p)
        const item = {
          name: v,
          path: p,
          time: stat.ctime,
          size: stat.size,
          tags: []
        }
        const fr = await DbFile.findOne({ path: p })
        if (fr) continue
        await DbFile.insert(item)
      }
      this.fetch()
    },
    execute (item) {
      shell.showItemInFolder(item.path)
    },
    openDialog (item) {
      this.selectedItem = item
      this.dialog = true
    },
    async changeTag () {
      await DbFile.update({ _id: this.selectedItem._id }, { $set: { tags: this.selectedItem.tags } })
      this.addTag()
    },
    addTag () {
      this.items.forEach(item => {
        const tags = item.tags
        tags.forEach(tag => {
          if (!this.tags.includes(tag)) this.tags.push(tag)
        })
      })
    },
    async delTag (item, tag) {
      await DbFile.update({ _id: item._id }, { $pull: { tags: tag } })
      await this.fetch()
    },
    async del (item) {
      await DbFile.remove({ _id: item._id })
      await this.fetch()
    },
    async ratingChange (item) {
      await DbFile.update({ _id: item._id }, { $set: { rating: item.rating } })
    }
  }
}
</script>
