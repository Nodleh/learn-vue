<template>
  <balance-detail :is-edit="false" />
</template>

<script>
import MedicineDetail from './components/BalanceDetail'

export default {
  name: 'CreateBalance',
  components: { MedicineDetail }
}
</script>

