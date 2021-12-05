<<<<<<< HEAD
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="query.id" placeholder="ID" style="width: 100px;" class="filter-item" @keyup.enter.native="handleFilter" />

      <el-date-picker
        v-model="value1"
        style="width: 200px; margin-left: 10px; margin-top: 10px;"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="选择日期"
      />

      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="by_id?search_id():search_date()">
        Search
      </el-button>
      <!-- <router-link :to="'/tab/create/' "> -->
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="add()">
        Add
      </el-button>
      <el-dialog title="新增" :visible.sync="dialogTableVisible2" center :append-to-body="true" :lock-scroll="false" width="30%">
        <create />
      </el-dialog>
      <!-- </router-link> -->
      <el-button v-waves :loading="downloadLoading" style="margin-left: 10px;" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="名称" min-width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建日期" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createdAt | parseTime('{y}-{m}-{d} ') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="频次" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.countSize }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="250">
        <template slot-scope="scope">
        <el-button @click=" search_news(scope.row)">查看相关资讯</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.index"
      :limit.sync="listQuery.max"
      @pagination="getList"
    />

  </div>
</template>

<script>
import { fetchList } from '@/api//medicine'
import { queryById, queryByDate, deleteBalance, getSum, getOut } from '@/api/balance'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import edit from './edit'
import create from './create'
const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination, edit, create },
  directives: { waves },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 10,
      listLoading: true,
      listQuery: {
        index: 1,
        max: 10,
        sortOrder: 0

      },
      query: {
        id: null
      },

      totalCount: 0,
      totalPages: 0,
      currentPage: 0,

      compute: false,
      value1: undefined,
      dialogTableVisible1: false,
      dialogTableVisible2: false,

      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: 0,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  computed: {
   
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list

        this.total = response.data.totalCount
        this.page_size = this.list.length
        this.total_pages = response.data.totalPages
        console.log(this.total_pages)
        this.current_page = response.data.currentPage
        console.log(this.total)
        this.listLoading = false
        console.log(this.list)
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
   
   search_news(e)
   {
     console.log("查询成功", e.name);
this.$router.push({
    path:'/medicine/news',
    query:{
      nameId:e.name},
  })


      },
    search_id() {
      this.listLoading = true
      console.log(this.query.id)
      queryById(this.query.id).then(response => {
        this.list = []
        this.list.push(response.data)
        console.log(this.list[0].projectName)
        if (this.list[0].balanceType == 1) {
          this.list[0].balanceType = '收入'
        } else {
          this.list[0].balanceType = '支出'
        }
        if (this.list.length == 0) {
          this.$message({
            message: '未查询到指定Id的账单',
            type: 'error'

          })
        }
        this.listLoading = false
      })
    },
    
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    // handleCreate() {
    //   this.resetTemp()
    //   this.dialogStatus = 'create'
    //   this.dialogFormVisible = true
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    // },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // delete
    handleDelete(id) {
      console.log(id)
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBalance(id).then((response) => {
          this.$notify({
            message: '删除成功'
          })
        })
      })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
=======
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="query.id" placeholder="ID" style="width: 100px;" class="filter-item" @keyup.enter.native="handleFilter" />

      <el-date-picker
        v-model="value1"
        style="width: 200px; margin-left: 10px; margin-top: 10px;"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="选择日期"
      />

      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="by_id?search_id():search_date()">
        Search
      </el-button>
      <!-- <router-link :to="'/tab/create/' "> -->
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="add()">
        Add
      </el-button>
      <el-dialog title="新增" :visible.sync="dialogTableVisible2" center :append-to-body="true" :lock-scroll="false" width="30%">
        <create />
      </el-dialog>
      <!-- </router-link> -->
      <el-button v-waves :loading="downloadLoading" style="margin-left: 10px;" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="名称" min-width="300px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建日期" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createdAt | parseTime('{y}-{m}-{d} ') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="频次" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.countSize }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="250">
        <template slot-scope="scope">
        <el-button @click=" search_news(scope.row)">查看相关资讯</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.index"
      :limit.sync="listQuery.max"
      @pagination="getList"
    />

  </div>
</template>

<script>
import { fetchList } from '@/api//medicine'
import { queryById, queryByDate, deleteBalance, getSum, getOut } from '@/api/balance'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import edit from './edit'
import create from './create'
const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination, edit, create },
  directives: { waves },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 10,
      listLoading: true,
      listQuery: {
        index: 1,
        max: 10,
        sortOrder: 0

      },
      query: {
        id: null
      },

      totalCount: 0,
      totalPages: 0,
      currentPage: 0,

      compute: false,
      value1: undefined,
      dialogTableVisible1: false,
      dialogTableVisible2: false,

      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: 0,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  computed: {
   
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list

        this.total = response.data.totalCount
        this.page_size = this.list.length
        this.total_pages = response.data.totalPages
        console.log(this.total_pages)
        this.current_page = response.data.currentPage
        console.log(this.total)
        this.listLoading = false
        console.log(this.list)
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
   
   search_news(e)
   {
     console.log("查询成功", e.name);
this.$router.push({
    path:'/medicine/news',
    query:{
      nameId:e.name},
  })


      },
    search_id() {
      this.listLoading = true
      console.log(this.query.id)
      queryById(this.query.id).then(response => {
        this.list = []
        this.list.push(response.data)
        console.log(this.list[0].projectName)
        if (this.list[0].balanceType == 1) {
          this.list[0].balanceType = '收入'
        } else {
          this.list[0].balanceType = '支出'
        }
        if (this.list.length == 0) {
          this.$message({
            message: '未查询到指定Id的账单',
            type: 'error'

          })
        }
        this.listLoading = false
      })
    },
    
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    // handleCreate() {
    //   this.resetTemp()
    //   this.dialogStatus = 'create'
    //   this.dialogFormVisible = true
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    // },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // delete
    handleDelete(id) {
      console.log(id)
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBalance(id).then((response) => {
          this.$notify({
            message: '删除成功'
          })
        })
      })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
>>>>>>> balance
