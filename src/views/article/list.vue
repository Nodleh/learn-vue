<template>
  <div class="app-container">
    <div class="handle-box">
      <router-link :to="'/article/create/' ">
                <el-button
                    type="primary"
                    icon="el-icon-plus"
                    class="handle-plus mr10"
                    
                >添加文章</el-button>
      </router-link>
                <el-input v-model="query.title" placeholder="文章标题" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch()">搜索</el-button>

                <el-button type="primary" icon="el-icon-refresh" @click="getList()">刷新</el-button>
            </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="标题">
        <template slot-scope="{ row }">
          <router-link :to="'/example/edit/' + row.id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="类型">
        <template slot-scope="scope">
          <span>{{ scope.row.articleType }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120px" align="center" label="来源">
        <template slot-scope="scope">
          <span>{{ scope.row.source }}</span>
        </template>
      </el-table-column>

      <el-table-column width="100px" label="权重">
        <template slot-scope="scope">
          <span>{{ scope.row.weight }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status" width="110">
        <template slot-scope="{ row }">
          <el-tag :type="row.active | statusFilter">
            {{ row.active }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="180px" align="center" label="发布时间">
        <template slot-scope="scope">
          <span>{{
            scope.row.createdAt | parseTime("{y}-{m}-{d} {h}:{i}")
          }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="250">
        <template slot-scope="scope">
          <router-link :to="'/article/edit/' + scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              编辑
            </el-button>
          </router-link>
          <el-button size="small" icon="el-icon-delete" @click="handleDelete(scope.row.id)" > 删除 </el-button>
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
import { fetchList,queryArticle,deleteArticle} from "@/api/article";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination
import qs from 'qs';

export default {
  name: "ArticleList",
  components: { Pagination },
  filters: {
    statusFilter(active) {
      const statusMap = {
          '已激活': 'success',
          '未激活': 'danger'
      };
      return statusMap[active];
    },
  },
  data() {
    return {
      query: {
                title: '',
                id: 0
            },
      list: null,
      nlist: {},
      total: 0,
      listLoading: true,
      listQuery: {
        index: 1,
        max: 10,
      },
      current_page: 0,
      total_pages: 0,
      page_size:0,

    };
  },
  created() {
    this.getList();
  },
  methods: {
    
    
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then((response) => {
        this.list = response.data.list;
        for(let n of this.list){
              if(n.active == 1){
                  n.active = '已激活'
              }
              else{ 
                  n.active = '未激活'
              }
        }
        this.total = response.data.totalCount;
        this.page_size = this.list.length;
        this.total_pages = response.data.totalPages;
        console.log(this.total_pages);
        this.current_page = response.data.currentPage;
        console.log(this.total);
        this.listLoading = false;
        console.log(this.list);
      });
    },
    //sort
    sortChange(column){
        this.current_page = 1;
        console.log(column.order);
        if(column.order == 'descending'){
          this.list.sort((a,b)=> b[this.column.prop]-a[this.column.prop])
        }else if(column.order == 'ascending'){
          this.list.sort((a,b)=> a[this.column.prop]-b[this.column.prop])
        }
    },
    //delete
    handleDelete(id) {
      this.$confirm('确定要删除吗?','提示',{
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'
      }).then(()=>{
          deleteArticle(id).then((response) => {
        this.$notify({
          message:'删除成功'
        })
        this.getList();
      });
      })
      
      

    },
    //update
    handleUpdate() {

    },
    // 触发搜索按钮
    handleSearch() {
      const _this = this;
      const keyword= _this.query.title;
      const index = _this.listQuery.index;
      const max = _this.listQuery.max;
      this.listLoading = true;
      queryArticle(keyword,index,max).then((response) => {
  
       _this.list = response.data.list;
        for(let n of _this.list){
              if(n.active == 1){
                  n.active = '已激活'
              }
              else{ 
                  n.active = '未激活'
              }
        }
       console.log(_this.list)
       _this.total = response.data.totalCount;
        _this.page_size = _this.list.length;
        _this.total_pages = response.data.totalPages;
        console.log(_this.total_pages);
        _this.current_page = response.data.currentPage;
        _this.listLoading = false;
        
        
        
      });
    },
   
    refreshData() {
      this.getData(1);
    },
  },
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}
.handle-select {
    width: 120px;
}
.handle-input {
    width: 300px;
    display: inline-block;
}
.mr10 {
    margin-right: 10px;
}
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
