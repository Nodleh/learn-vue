<template>
  <balance-detail :is-edit="true" :f_id="id"/>
</template>

<script>
import BalanceDetail from './components/BalanceDetail'

export default {
  name: 'EditForm',
  components: { BalanceDetail },
  props:{
    f_id: {
      type:Number,
      default:0
    }

  },
  computed: {
    id(){
      return this.f_id;
    }
  }
  
}
</script>

