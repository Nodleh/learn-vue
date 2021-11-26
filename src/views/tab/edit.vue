<template>
  <balance-detail :is-edit="true" />
</template>

<script>
import BalanceDetail from './components/BalanceDetail'

export default {
  name: 'EditForm',
  components: { BalanceDetail }
}
</script>

