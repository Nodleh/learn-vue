<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="query.id" placeholder="id" style="width: 100px;" class="filter-item"  @keyup.enter.native="handleFilter" />
      <el-date-picker style="width: 200px; margin-left: 10px; margin-top: 10px;"
      v-model="value1"
      type="date"
      value-format="yyyy-MM-dd"
      placeholder="选择日期"></el-date-picker>
    
      <el-button v-waves class="filter-item"  style="margin-left: 10px;"  type="primary" icon="el-icon-search" @click="by_id?search_id():search_date()">
        Search
      </el-button>
       <!-- <router-link :to="'/tab/create/' "> -->
          <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click = "add()">
                Add
          </el-button>
            <el-dialog title="新增" :visible.sync="dialogTableVisible2" center :append-to-body='true' :lock-scroll="false" width="30%">
               <create ></create>
             </el-dialog>
       <!-- </router-link> -->
      <el-button v-waves :loading="downloadLoading" style="margin-left: 10px;"  class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
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
      <el-table-column label="ID"  align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.date | parseTime('{y}-{m}-{d} ') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目名称" min-width="20px">
        <template slot-scope="{row}">
          <span>{{ row.projectName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当日收入支出" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.revenue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="负责人" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.master }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.note }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.balanceType | statusFilter">{{ row.balanceType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="250">
        <template slot-scope="scope">
          <!-- <router-link :to="'/tab/edit/' + scope.row.id"> -->
            <el-button type="primary" size="small" icon="el-icon-edit" @click="edit(scope.row.id) ">
              编辑
            </el-button>
            
          <!-- </router-link> -->
          <el-button size="small" icon="el-icon-delete" @click="handleDelete(scope.row.id)" > 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog  title="编辑" :visible.sync="dialogTableVisible1" center :append-to-body='true' :lock-scroll="false" width="30%">
        <edit :f_id="f_id"></edit>
    </el-dialog>
    
    <p v-show="compute && !by_id">总收入:{{total_in}}</p>
    <p v-show="compute && !by_id">总支出:{{total_out}}</p>
    
    
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import { queryById,queryByDate,deleteBalance,getSum,getOut } from '@/api/balance'
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
  components: { Pagination,edit,create },
  directives: { waves },
  filters: {
    statusFilter(active) {
      const statusMap = {
          '收入': 'success',
          '支出': 'danger'
      };
      return statusMap[active];
    },
  },
  data() {
    return {
      f_id: null,
      tableKey: 0,
      list: null,
      total: 10,
      listLoading: true,
      listQuery: {
        index: 1,
        max: 20,
        
      },
      query:{
        id: null,
      },
      total_in: 0,
      total_out: 0,
      
      compute:false,
      value1:undefined,
      dialogTableVisible1:false,
       dialogTableVisible2:false,
       
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
  created() {
    this.getList()
  },
  computed: {
      by_id(){
        if(this.query.id && !this.value1)
         return  true;
        else
         return  false;

      },
      
     

  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    add(){
       this.dialogTableVisible2 = true;
    },
    edit(id){
       this.f_id = id;
       this.dialogTableVisible1 = true; 
       
    },
    search_id() {
      this.listLoading = true
      console.log(this.query.id)
      
      queryById(this.query.id).then(response => {
        this.list = [];
         this.list.push(response.data);
         console.log(this.list[0].projectName);
         if(this.list[0].balanceType == 1){
            this.list[0].balanceType = '收入'
          }
          else{ 
                 this.list[0].balanceType = '支出'
          }
         if(this.list.length == 0){
           
           this.$message({
             message: '未查询到指定Id的账单',
             type: 'error'

           })
         }
         this.listLoading = false
      })
    },
    search_date(){
       const _this = this;
       const index = _this.listQuery.index;
       const max = _this.listQuery.max;
       const date = this.value1;
       _this.compute = true;
       _this.listLoading = true;
       _this.total_in = 0;
       _this.total_out = 0;
       queryByDate(index,max,date).then(response=>{
         _this.list = response.data.list;
         for(let n of _this.list){
              if(n.balanceType == 1){
                  n.balanceType = '收入'
              }
              else{ 
                  n.balanceType = '支出'
              }
        }
        getSum(date).then(response=>{
          _this.total_in = response.data
        })
        getOut(date).then(response=>{
          _this.total_out = response.data
        })
         if(_this.list.length === 0){
           
           _this.$message({
             message: '未查询到指定日期的账单',
             type: 'error'

           })
         }
         console.log(_this.list);
         _this.listLoading = false
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
   //delete
    handleDelete(id) {
      console.log(id)
      this.$confirm('确定要删除吗?','提示',{
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'
      }).then(()=>{
          deleteBalance(id).then((response) => {
        this.$notify({
          message:'删除成功'
        })
      });
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
