<template>
  
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

     

      <div class="createPost-main-container">
        <el-row>
          <!-- <Warning /> -->

          <el-col :span="24">

            <div class="postInfo-container">
              <el-row>
                <el-row>
                <el-col :span="8">
                  <el-form-item label-width="90px" label="日期:" class="postInfo-container-item" prop="date" >
                    <el-date-picker v-model="postForm.date" type="date" value-format="yyyy-MM-dd " placeholder="选择日期" />
                  </el-form-item>
                </el-col>
                </el-row>
                <el-row>
                <el-col :span="24" v-show="!isEdit">
                  <el-form-item label-width="90px" label="项目名称:" class="postInfo-container-item" prop="projectId">
                     <el-select v-model="postForm.projectId">
                        <el-option v-for="(item, index) in options"
                              :key="index"
                              :value="item.value"
                              :label="item.label">
                        </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                </el-row>
                <el-row>
                <el-col :span="24" v-show="isEdit">
                  <el-form-item label-width="90px" label="项目Id:" class="postInfo-container-item" >
                     <el-input v-model="postForm.projectName"   placeholder="项目"></el-input>
                  </el-form-item>
                </el-col>
                </el-row>
                <el-row>
                <el-col :span="24">
                  <el-form-item label-width="90px" label="收入/支出:" class="postInfo-container-item"
                  prop="revenue"
                   >
                    <el-input v-model="postForm.revenue"   placeholder="收入/支出"></el-input>
                  </el-form-item>
                </el-col>
                </el-row>
                <el-row>
                <el-col :span="24">
                  <el-form-item label-width="90px" label="负责人:" class="postInfo-container-item" prop="master">
                    <el-input v-model="postForm.master"  placeholder="负责人"></el-input>
                  </el-form-item>
                </el-col>
                </el-row>
                <el-row>
                <el-col :span="24">
                  <el-form-item label-width="90px" label="备注:" class="postInfo-container-item">
                    <el-input
                      v-model="postForm.note"
                    />
                  </el-form-item>
                </el-col>
                </el-row>
               <el-row>
                <el-col :span="24" v-show="!isEdit">
                  <el-form-item label-width="90px" label="类型:" class="postInfo-container-item" prop="balanceType">
                     <el-select v-model="postForm.balanceType">
                        <el-option v-for="(item, index) in type"
                              :key="index"
                              :value="item.value"
                              :label="item.label">
                        </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                </el-row>
                <el-row>
                <el-col :span="24" v-show="isEdit">
                  <el-form-item label-width="90px" label="类型:" class="postInfo-container-item" >
                     <el-input v-model="postForm.balanceType"   placeholder="类型"></el-input>
                  </el-form-item>
                </el-col>
                </el-row>
              </el-row>
            </div>
          </el-col>
        </el-row>
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" 
        @click="submitForm()"
        >
          提交
        </el-button>
        
      </div>
    </el-form>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import Upload from '@/components/Upload/SingleImage3'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { validURL } from '@/utils/validate'
import { createBalance,fetchBalance } from '@/api/balance'
import { searchUser } from '@/api/remote-search'
import Warning from './Warning'
import { CommentDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'
import qs from 'qs'

const defaultForm = {
  date: undefined,
  projectId: undefined,
  revenue: 0.0,
  note: '',
  master:'',
  balanceType: 0,
  projectName:''
 
}

export default {
  name: 'BalanceDetail',
  components: { Tinymce, MDinput, Upload, Sticky, Warning, CommentDropdown, PlatformDropdown, SourceUrlDropdown },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    f_id:{
      type: Number,
      default: 0
    }
    
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必传项'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: '外链url填写不正确',
            type: 'error'
          })
          callback(new Error('外链url填写不正确'))
        }
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        date: [{ validator: validateRequire }],
        projectId: [{ validator: validateRequire }],
        revenue: [{ validator: validateRequire }],
        master: [{ validator: validateRequire }]
      },
      tempRoute: {},
      type:[{
        label: '收入',
        value: 1

      },
      {
        label: '支出',
        value: 0
      }
      ],
      options:[{ 
            label: '销货收入',
            value: 1
       },
       {    
            label: '其他收入',
            value: 2
       },
       {    
            label: '零食采购',
            value: 3
       },
       {    
            label: '采购支出',
            value: 4
       },
       {    
            label: '房租',
            value: 5
       },
       {    
            label: '工资',
            value: 6
       },
       {    
            label: '利息支出',
            value: 7
       },
       {    
            label: '办公费',
            value: 8
       },
       {    
            label: '水电',
            value: 9
       },
       {    
            label: '运费',
            value: 10
       },
       {    
            label: '招待',
            value: 11
       },
       {    
            label: '其他',
            value: 12
       },
       ]
    }
  },
  computed: {
    contentShortLength() {
      //return this.postForm.keyword.length
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.display_time))
      },
      set(val) {
        this.postForm.display_time = new Date(val)
      }
    },
    
  },
  created() {
    if (this.isEdit) {
      const id = this.f_id;
      console.log(id+" created");
      this.fetchData(id)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchBalance(id).then(response => {
        this.postForm = response.data
        
        console.log(this.projectId)
        // just for test
        this.postForm.title += `   Article Id:${this.postForm.id}`
        this.postForm.keyword += `   Article Id:${this.postForm.id}`

        // set tagsview title
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = 'Edit Article'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Article'
      document.title = `${title} - ${this.postForm.id}`
    },
    submitForm() {
      console.log(this.postForm)
      const postData =qs.stringify(this.postForm) 
      createBalance(postData).then((response) =>{
        console.log(response.data)
        console.log(response.list)
      })
      console.log("请求")
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$notify({
            title: '成功',
            message: '添加账单成功',
            type: 'success',
            duration: 2000
          })
          this.postForm.status = 'published'
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
      
      
    },
    draftForm() {
      if (this.postForm.body.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
    },
    getRemoteUserList(query) {
      searchUser(query).then(response => {
        if (!response.data.items) return
        this.userListOptions = response.data.items.map(v => v.name)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;
 
  .createPost-main-container {
    padding: 50px 50px 50px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;
      
      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
