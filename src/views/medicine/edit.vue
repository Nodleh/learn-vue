<template>
  <balance-detail :is-edit="true" :f_id="id" />
</template>

<script>
import MedicineDetail from './components/MedicineDetail'

export default {
  name: 'EditForm',
  components: { MedicineDetail },
  props: {
    f_id: {
      type: Number,
      default: 0
    }

  },
  computed: {
    id() {
      return this.f_id
    }
  }

}
</script>

