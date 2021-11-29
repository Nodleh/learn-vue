<template>
  <balance-detail :is-edit="false" />
</template>

<script>
import BalanceDetail from './components/MedicineDetail'

export default {
  name: 'CreateMedicine',
  components: { BalanceDetail }
}
</script>

