<template>
  <div class="wrapper-dgxl">
    <div ref="dgxl" class="grid"></div>
  </div>
</template>

<script>
import DataGridXL from "@datagridxl/datagridxl2";

export default {
  name: "data-grid",
  props: {
    data: {required: false, type: Array}
  },
  data() {
    return { inputData : this.data}
  },
  computed: {
    dgxlOptions() {
      var custom_theme = {
        "scrollbar|border": "#FFFFFF",
      } 
      var tableData = !this.inputData.length ? DataGridXL.createEmptyData(100, 100) : this.inputData;
      return {
        data: tableData,
        contextMenuItems: [],
        topBar: [],
        bottomBar: [],
        allowFreezeCols: false,
        allowFreezeRows: false,
        theme: custom_theme
      };
    },
  },
  mounted: function () {
    const dgxlObj = new DataGridXL(this.$refs.dgxl, this.dgxlOptions);
    Object.assign(this, { dgxlObj });
  },
};
</script>

<style>
.grid {
  height: 400px;
}
</style>