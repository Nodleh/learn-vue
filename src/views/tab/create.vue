<template>
  <balance-detail :is-edit="false" />
</template>

<script>
import BalanceDetail from './components/BalanceDetail'

export default {
  name: 'CreateBalance',
  components: { BalanceDetail }
}
</script>

