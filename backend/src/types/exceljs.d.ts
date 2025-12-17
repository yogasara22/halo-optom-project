declare module 'exceljs' {
  class Worksheet {
    columns: Array<{
      header: string;
      key: string;
      width: number;
    }>;
    addRow(row: any): void;
    getRow(index: number): any;
    getCell(address: string): any;
    mergeCells(range: string): void;
  }

  class Workbook {
    constructor();
    addWorksheet(name: string): Worksheet;
    xlsx: {
      writeBuffer(): Promise<Buffer>;
      write(stream: any): Promise<void>;
    };
  }

  const ExcelJS: {
    Workbook: { new(): Workbook };
  };

  export = ExcelJS;
}