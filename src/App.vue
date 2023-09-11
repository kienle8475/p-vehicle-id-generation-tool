<template>
  <div>
    <b-container fluid="sm">
      <b-card class="mt-3" :header="$t('page.schema.header')">
        <b-form @submit="onSubmit" v-if="show">
          <b-row>
            <b-col>
              <b-form-group id="input-group-1" :label="$t('page.schema.title_prefix')" label-for="input-1"
                :description="$t('page.schema.title_prefix_example')">
                <b-form-input id="input-1" v-model="schema.prefix_string" type="text" required></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-2" :label="$t('page.schema.title_start_number')" min="1"
                label-for="input-2">
                <b-form-input id="input-2" v-model.number="schema.start_number" type="number" required></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-3" :label="$t('page.schema.title_stop_number')" min="1" max="99999"
                label-for="input-3">
                <b-form-input id="input-3" v-model.number="schema.stop_number" type="number" required @change="onStopNumberChange"></b-form-input>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group id="input-group-4" :label="$t('page.schema.title_plate_type')" label-for="input-3">
                <b-form-select
                  id="input-4"
                  v-model="schema.pad_number"
                  :options="pads"
                  required
                ></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="3">
              <b-form-group id="input-group-5" :label="$t('page.schema.title_no_of_row')" min="1" label-for="input-4">
                <b-form-input id="input-5" v-model.number="schema.no_of_row" type="number" required></b-form-input>
              </b-form-group>
            </b-col>
            <b-col cols="3">
              <b-form-group id="input-group-6" :label="$t('page.schema.title_no_of_column')" min="1"
                label-for="input-5">
                <b-form-input id="input-6" v-model.number="schema.no_of_col" type="number" required></b-form-input>
              </b-form-group>
            </b-col>
            <b-col cols="6">
              <b-form-group id="input-group-7" :label="$t('page.schema.title_exclude')" label-for="input-6"
              :description="text_exclude_description">
                <b-row>
                  <b-col>
                    <b-form-file id="input-7" :v-model="exFiles" @change="onFileChange" ref="excludes-file-input"
                      :placeholder="$t('common.upload_placeholder')"></b-form-file>
                  </b-col>
                  <b-col cols="12" md="auto">
                    <b-button ariant="danger" @click="clearFiles">{{ $t('page.btn_clear_file') }}</b-button>
                  </b-col>
                </b-row>
              </b-form-group>
            </b-col>
          </b-row>
          <b-container class="mt-3">
            <b-row class="justify-content-md-center">
              <b-col cols="12" md="auto"> <b-button variant="success" type="submit">{{ $t('page.btn_generate') }}</b-button></b-col>
            </b-row>
          </b-container>
        </b-form>
      </b-card>
      <b-card class="mt-3" :header="$t('page.preview.header')">
        <DataGrid v-bind:data="rsArray" :key="reload"></DataGrid>
      </b-card>
      <b-card class="mt-3" :header="$t('page.print.header')">
        <b-container class="mt-3">
          <b-row class="justify-content-md-center">
            <b-col cols="6" md="auto"> 
              <b-button variant="success" @click="downloadXLSX">{{ $t('page.btn_download_xlsx') }}
                <b-icon icon="file-spreadsheet" aria-hidden="true"></b-icon>
              </b-button>
            </b-col>
            <b-col cols="6" md="auto"> 
              <b-button variant="danger" @click="downloadXLSX">{{ $t('page.btn_download_pdf') }}
                <b-icon icon="file-pdf" aria-hidden="true"></b-icon>
              </b-button>
            </b-col>
          </b-row>
        </b-container>
      </b-card>
    </b-container>
    <Footer></Footer>
  </div>
 
</template>

<script>
import DataGrid from './components/DataGrid.vue';
import Footer from './components/templates/Footer.vue'
import ExcelJS from "exceljs";
import * as FileSaver from 'file-saver';

export default {
  name: 'app',

  components: {
    DataGrid,
    Footer
  },

  data() {
    return {
      schema: {
        prefix_string: '81AA',
        start_number: 1,
        stop_number: 9999,
        pad_number: 4,
        no_of_row: 50,
        no_of_col: 5,
        step: 1,
        excludes: []
      },
      pageSetup: { 
        paperSize: 9, 
        orientation: 'portrait',
        margins: {
          left: 0.75, right: 0.5,
          top: 0.75, bottom: 0.75,
          header: 0.25, footer: 0.25
        },
        printTitlesRow: '1:1',
        printTitlesColumn: 'A:D',
      },
      pads: [
        { text: this.$t("page.schema.4_characters"), value: 4, disabled: false}, 
        { text: this.$t("page.schema.5_characters"), value: 5, disabled: false }],
      sheet_header: [this.$t("sheet.header.index"), this.$t("sheet.header.number_plate")],
      footer : "&CPage &P of &N",
      exFiles: null,
      rsArray: [],
      reload: 0,
      show: true
    };
  },

  computed: {
    formState() {
      return {
        prefix: this.schema.prefix_string.length > 0,
        start_number: this.schema.start_number > 0,
        stop_number: this.schema.stop_number > 0 && this.schema.stop_number < 100000,
        no_of_row: this.schema.no_of_row > 0,
        no_of_col: this.schema.no_of_col > 0,
      };
    },
  },

  methods: {
    onSubmit(event) {
      event.preventDefault();
      const dataInput = {
        prefix: this.schema.prefix_string,
        start: parseInt(this.schema.start_number),
        stop: parseInt(this.schema.stop_number),
        row: parseInt(this.schema.no_of_row),
        col: parseInt(this.schema.no_of_col),
        step: parseInt(this.schema.step),
        pad: parseInt(this.schema.pad_number),
        exclude: this.schema.excludes
      };
      const dataGenerated = this.generateData(
        dataInput.prefix,
        dataInput.start,
        dataInput.stop,
        dataInput.row,
        dataInput.col,
        dataInput.step,
        dataInput.pad,
        dataInput.exclude,
      );
      const rsHeader = Array((dataGenerated[0].length)/2).fill(this.sheet_header).flat();
      this.rsArray = [rsHeader].concat(dataGenerated);
      this.reload++;
    },

    onFileChange(e) {
      var exFiles = e.target.files || e.dataTransfer.files;
      if (!exFiles.length)
        return;
      this.createInput(exFiles[0]);
    },

    createInput(file) {
      var reader = new FileReader();
      var vm = this;
      reader.onload = (e) => {
        vm.fileInput = reader.result;
      }
      reader.readAsText(file);
      
      reader.onload = (event) => {
        const csvData = event.target.result;
        this.schema.excludes = Array.from(csvData.split(",")).map((e) => parseInt(e));
      }
    },

    clearFiles() {
      this.$refs['excludes-file-input'].reset();
      this.schema.excludes = [];
    },

    onStopNumberChange(value) {
      this.schema.pad_number = (value > 9999) ? 5 : 4;
    },

    async downloadXLSX() {
      const workbookOptions = {
        useStyles: true,
        useSharedStrings: true,
      };

      // Config workbook
      const workbook = new ExcelJS.Workbook(workbookOptions);
      workbook.creator = "kienle.8475@gmail.com";
      workbook.lastModifiedBy = "kienle.8475@gmail.com";
      workbook.created = new Date();

      // Force workbook calculation on load
      //workbook.calcProperties.fullCalcOnLoad = true;
      const worksheet = workbook.addWorksheet("DATA", {
        pageSetup: this.pageSetup
      });

      worksheet.headerFooter.oddFooter = this.footer
      worksheet.headerFooter.evenFooter = this.footer

      this.rsArray.forEach((element, index) => {
        worksheet.addRow(element);
        const worksheetRowIndex = index + 1;
        if ((index != 0) && (index)%parseInt(this.schema.no_of_row) == 0) {
          const row = worksheet.getRow(worksheetRowIndex);
          row.addPageBreak();
          row.commit();
        }
      });

      for(let i = 0; i < this.rsArray[0].length;i++){
        const col = worksheet.getColumn(i + 1);
        col.width = (i % 2 == 0) ? 5.5 : 11.5;
      };

      const fileName = this.$t("file.file_name") + this.schema.prefix_string+".xlsx";
      await workbook.xlsx.writeBuffer().then(data => {
        const blob = new Blob([data], { type: this.blobType });
        FileSaver.saveAs(blob, fileName);
      });
    },

    generateSerials(prefix, start, stop, step, padNumber, excludeSerials) {
      const serials = (start, stop, step) => Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => (start + index * step)
      );
      return serials(start, stop, step).filter((item) => !excludeSerials.includes(item))
        .map((el) => prefix + "-" + el.toString().padStart(padNumber, "0"));
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

    generateData(prefix, start, stop, row, col, step, padNumber, arrayExclude) {
      let dataTrans = [];
      let indexTrans = [];
      let data = this.generateSerials(prefix, start, stop, step, padNumber, arrayExclude);
      let index = Array.from({ length: data.length }, (v, i) => i + 1);

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
