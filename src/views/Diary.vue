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
          @click="dialogAddOpen()"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="items"
        >
          <template v-slot:[`item.createdAt`]="{item}">
            {{ item.createdAt.toLocaleString() }}
          </template>
          <template v-slot:[`item.updatedAt`]="{item}">
            {{ item.createdAt.toLocaleString() }}
          </template>
          <template v-slot:[`item.title`]="{item}">
            <a @click="dialogReadOpen(item)">{{ item.title }}</a>
          </template>
          <template v-slot:[`item._id`]="{item}">
            <v-btn @click="dialogEditOpen(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn @click="del(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="dialogAdd">
      <v-card>
        <v-card-title>글 작성</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="title"
            label="제목"
          />
          <v-text-field
            v-model="content"
            label="내용"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="add">
            저장
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogEdit">
      <v-card>
        <v-card-title>글 수정</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="title"
            label="제목"
          />
          <v-text-field
            v-model="content"
            label="내용"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="update">
            수정
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogRead">
      <v-card>
        <v-card-title>{{ select.title }}</v-card-title>
        <v-card-text>
          <v-text-field
            :value="select.content"
            label="내용"
          />
        </v-card-text>
        <!-- <v-card-actions>
          <v-btn>닫기</v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
const Datastore = require('nedb-promises')
const Diary = Datastore.create('diary.db')
const DiaryContent = Datastore.create('diaryContent.db')

export default {
  data () {
    return {
      editMode: true,
      title: '',
      content: '',
      dialogAdd: false,
      dialogEdit: false,
      dialogRead: false,
      headers: [
        { value: 'createdAt', text: '작성일' },
        { value: 'updatedAt', text: '수정일' },
        { value: 'title', text: '제목' },
        { value: '_id', text: 'actions' }
      ],
      items: [],
      select: {
        title: '',
        content: ''
      }
    }
  },
  async mounted () {
    // await this.removeAll()
    await this.list()
  },
  methods: {
    dialogAddOpen () {
      this.title = ''
      this.content = ''
      this.dialogAdd = true
    },
    async dialogEditOpen (item) {
      this.title = item.title
      const dc = await DiaryContent.findOne({ _id: item._content })
      this.content = dc.content
      this.select = item
      this.dialogEdit = true
    },
    async dialogReadOpen (item) {
      this.title = item.title
      const dc = await DiaryContent.findOne({ _id: item._content })
      this.content = dc.content
      this.select = item
      this.select.content = this.content
      this.dialogRead = true
    },
    async removeAll () {
      await DiaryContent.remove({}, { multi: true })
      await Diary.remove({}, { multi: true })
    },
    async add () {
      const dc = await DiaryContent.insert({ content: this.content })
      await Diary.insert({
        title: this.title,
        _content: dc._id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      this.dialogAdd = false
      await this.list()
    },
    async list () {
      this.items = await Diary.find()
      console.log(this.items)
    },
    async update () {
      await DiaryContent.update({ _id: this.select._content }, { $set: { content: this.content } })
      await Diary.update(
        { _id: this.select._id },
        {
          $set: {
            title: this.title,
            updatedAt: new Date()
          }
        }
      )
      this.dialogEdit = false
      await this.list()
    },
    async del (item) {
      await DiaryContent.remove({ _id: item._content })
      await Diary.remove({ _id: item._id })
      await this.list()
    }
  }
}
</script>
