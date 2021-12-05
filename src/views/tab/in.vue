<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="query.id" placeholder="id" style="width: 200px; margin-left: 10px; margin-top: 10px;"></el-input> -->
      <el-date-picker style="width: 200px; margin-left: 10px; margin-top: 10px;"
      v-model="value1"
      type="date"
      value-format="yyyy-MM-dd"
      placeholder="选择日期"></el-date-picker>
      <el-radio v-model="radio" label=1>收入</el-radio>
      <el-radio v-model="radio" label=2>支出</el-radio>
      <el-button v-waves class="filter-item"  style="margin-left: 10px;"  type="primary" icon="el-icon-search" @click="by_id?search_id():search_date()">
        查询
      </el-button>
       <!-- <router-link :to="'/tab/create/' "> -->
          <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click = "add()">
                添加
          </el-button>
            <el-dialog title="新增" :visible.sync="dialogTableVisible2" center :append-to-body='true' :lock-scroll="false" width="30%">
               <create ></create>
             </el-dialog>
       <!-- </router-link> -->
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
      <el-table-column label="当日收入/支出" width="110px" align="center" v-if="this.display_all">
        <template slot-scope="{row}">
          <span>{{ row.revenue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当日收入" width="110px" align="center" v-if=" this.display_in">
        <template slot-scope="{row}">
          <span>{{ row.revenue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当日支出" width="110px" align="center" v-if=" this.display_out">
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
            <el-button type="primary" size="small" icon="el-icon-edit" @click="edit(scope.row.id)">
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
    
    <p v-show="compute && !by_id  && this.display_in">总收入:{{total_in}}</p>
    <p v-show="compute && !by_id  && this.display_out">总支出:{{total_out}}</p>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.index"
      :limit.sync="listQuery.max"
      @pagination="search_date()"
    />
    
  </div>
</template>

<script>
import { queryById,queryByDate,deleteBalance,getSum,getOut,queryInList,queryOutList } from '@/api/balance'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import edit from './edit'
import create from './create'


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
      radio: 0,
      display_in:false,
      display_out:false,
      display_all:true,
      compute:false,
      value1:new Date,
      dialogTableVisible1:false,
      dialogTableVisible2:false,
      downloadLoading: false
    }
  },
  created() {
    this.search_date()
    
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
    add(){
       this.dialogTableVisible2 = true;
    },
    edit(id){
       this.f_id = id;
       this.dialogTableVisible1 = true; 
       
    },
    search_id() {
      this.listLoading = true
      queryById(this.query.id).then(response => {
        this.list = [];
         this.list.push(response.data);
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
         this.listLoading = false;
         
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
       
       if(this.radio == 1){
          getSum(date).then(response=>{
          _this.total_in = response.data
        })
         queryInList(index,max,date).then(response => {
           
           _this.list = response.data.list;
           
         for(let n of _this.list){
              n.balanceType = '收入'
        }
        this.total = response.data.totalCount;
        this.total_pages = response.data.totalPages;
        this.current_page = response.data.currentPage;
        this.display_in = true;
        this.display_all = false;
        _this.listLoading = false;
       
        this.radio = 0;
         })
       }
       else if(this.radio == 2){
         getOut(date).then(response=>{
          _this.total_out = response.data
        })
         queryOutList(index,max,date).then(response => {
           
           _this.list = response.data.list;
         for(let n of _this.list){
               n.balanceType = '支出'
        }
        this.total = response.data.totalCount;
        this.total_pages = response.data.totalPages;
        this.current_page = response.data.currentPage;
        _this.listLoading = false;
        this.display_out = true;
        this.display_all = false;
        this.radio = 0;
         })
       }
       else{
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
        this.total = response.data.totalCount;
        this.total_pages = response.data.totalPages;
        this.current_page = response.data.currentPage;
        
        
         if(_this.list.length === 0){
           
           _this.$message({
             message: '未查询到指定日期的账单',
             type: 'error'

           })
         }
         console.log(_this.list);
         _this.listLoading = false
       })
       }
       this.display_in = false;
       this.display_out = false;
       this.display_all = true;
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
    
    
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
