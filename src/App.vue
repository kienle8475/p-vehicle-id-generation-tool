<template>
  <div>
    <b-container fluid="sm">
      <b-card class="mt-3" :header="$t('output.schema.header')">
        <b-form @submit="onSubmit" v-if="show">
          <b-row>
            <b-col>
              <b-form-group id="input-group-1" :label="$t('output.schema.title_prefix')" label-for="input-1"
                :description="$t('output.schema.title_prefix_example')">
                <b-form-input id="input-1" v-model="schema.prefix_string" type="text" required></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-2" :label="$t('output.schema.title_start_number')" min="1"
                label-for="input-2">
                <b-form-input id="input-2" v-model.number="schema.start_number" type="number" required></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-3" :label="$t('output.schema.title_stop_number')" min="1" max="99999"
                label-for="input-3">
                <b-form-input id="input-3" v-model.number="schema.stop_number" type="number" required></b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-group id="input-group-4" :label="$t('output.schema.title_no_of_row')" min="1" label-for="input-4">
                <b-form-input id="input-4" v-model.number="schema.no_of_row" type="number" required></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-5" :label="$t('output.schema.title_no_of_column')" min="1"
                label-for="input-5">
                <b-form-input id="input-5" v-model.number="schema.no_of_col" type="number" required></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-6" :label="$t('output.schema.title_exclude')" label-for="input-6">
                <b-form-file id="input-6" :placeholder="$t('common.upload_placeholder')"></b-form-file>
              </b-form-group>
            </b-col>
          </b-row>
          <b-container class="mt-3">
            <b-row class="justify-content-md-center">
              <b-col cols="12" md="auto"> <b-button variant="success" type="submit">Tạo danh sách</b-button></b-col>
            </b-row>
          </b-container>
        </b-form>
      </b-card>
      <b-card class="mt-3" :header="$t('output.preview.header')">
        <DataGrid v-bind:data="rsArray" :key="reload"></DataGrid>
      </b-card>
      <b-card class="mt-3" :header="$t('output.paper.header')">
        <b-container class="mt-3">
        <b-row class="justify-content-md-center">
          <b-col cols="12" md="auto"> <b-button variant="success" @click="generateXLSX">Tải tệp excel</b-button></b-col>
        </b-row>
      </b-container>
      </b-card>
    </b-container>
  </div>
</template>

<script>
import DataGrid from './components/DataGrid.vue';
import ExcelJS from "exceljs";
import * as FileSaver from 'file-saver';

export default {
  name: 'app',

  components: {
    DataGrid
  },

  data() {
    return {
      schema: {
        prefix_string: '81-AA',
        start_number: 1,
        stop_number: 100,
        no_of_row: 10,
        no_of_col: 5,
        step: 1,
        excludes: []
      },
      sheet_header: [this.$t("output.sheet.header.index"), this.$t("output.sheet.header.vehicle_id")],
      rsArray: [],
      reload: 0,
      show: true
    }
  },

  computed: {
    formState() {
      return {
        prefix: this.schema.prefix_string.length > 0,
        start_number: this.schema.start_number > 0,
        stop_number: this.schema.stop_number > 0 && this.schema.stop_number < 100000,
        no_of_row: this.schema.no_of_row > 0,
        no_of_col: this.schema.no_of_col > 0,
      }
    }
  },

  methods: {
    onSubmit(event) {
      event.preventDefault()
      const dataInput = {
        prefix: this.schema.prefix_string,
        start: parseInt(this.schema.start_number),
        stop: parseInt(this.schema.stop_number),
        row: parseInt(this.schema.no_of_row),
        col: parseInt(this.schema.no_of_col),
        step: parseInt(this.schema.step),
        exclude: this.schema.excludes
      }
      const dataGenerated = this.generateData(
        dataInput.prefix,
        dataInput.start,
        dataInput.stop,
        dataInput.row,
        dataInput.col,
        dataInput.step,
        dataInput.exclude,
       )
      const rsHeader = Array(dataInput.col).fill(this.sheet_header).flat()
      this.rsArray = [rsHeader].concat(dataGenerated)
      this.reload ++
    },

    async generateXLSX() {
      const options = {
        filename: "./streamed-workbook.xlsx",
        useStyles: true,
        useSharedStrings: true,
      };

      // Config workbook
      const workbook = new ExcelJS.Workbook(options);
      workbook.creator = "kienle.8475@gmail.com";
      workbook.lastModifiedBy = "kienle.8475@gmail.com";
      workbook.created = new Date();

      // Force workbook calculation on load
      //workbook.calcProperties.fullCalcOnLoad = true;
      const worksheet = workbook.addWorksheet("DATA",{
        pageSetup:{paperSize: 9, orientation:'portrait'}
      });

      this.rsArray.forEach(element => {
        worksheet.addRow(element);
      });

      const fileName = "Data.xlsx";
      await workbook.xlsx.writeBuffer().then(data => {
        const blob = new Blob([data], { type: this.blobType }); 
        FileSaver.saveAs(blob, fileName);
        });
    },

    generateSerials(prefix, start, stop, step, excludeSerials) {
      const serials = (start, stop, step) => Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => (start + index * step)
      )
      return serials(start, stop, step).filter((item) => !excludeSerials.includes(item))
        .map((el) => prefix + "-" + el.toString().padStart(5, "0"))
    },

    transposeArray(array, columns) {
      let transposedArray = [];
      for (let i = 0; i < columns; i++) {
        transposedArray.push([]);
      }
      for (let i = 0; i < array.length; i++) {
        let columnIndex = i % columns;
        transposedArray[columnIndex].push(array[i]);
      }
      return transposedArray;
    },

    chunksArray(array, size) {
      var results = [];
      while (array.length) {
        results.push(array.splice(0, size));
      }
      return results;
    },

    mergeArray(array1, array2) {
      let result = array1.map((subArray, index) => {
        let mergedSubArray = [];
        for (let i = 0; i < subArray.length; i++) {
          mergedSubArray.push(subArray[i], array2[index][i]);
        }
        return mergedSubArray;
      });
      return result;
    },

    generateData(prefix, start, stop, row, col, step, arrayExclude) {
      let dataTrans = [];
      let indexTrans = [];
      let data = this.generateSerials(prefix, start, stop, step, arrayExclude);
      let index = Array.from({ length: data.length }, (v, i) => i + 1)

      let dataSplit = this.chunksArray(data, row * col);
      let indexSplit = this.chunksArray(index, row * col);

      for (let i = 0; i < indexSplit.length; i++) {
        dataTrans.push(...this.transposeArray(dataSplit[i], row));
        indexTrans.push(...this.transposeArray(indexSplit[i], row));
      }
      return this.mergeArray(indexTrans, dataTrans);
    }
  }
}
</script>
