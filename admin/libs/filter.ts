declare const dayjs: any

const filter = {
  empty_val: '-',
  // filter方法
  formateTime(val: number, format = 'YYYY/MM/DD HH:mm'): string {
    return val ? dayjs(val).format(format) : this.empty_val
  },
  formateStringNumberTime(val: string, format = 'YYYY/MM/DD HH:mm'): string {
    return +val ? dayjs(+val).format(format) : this.empty_val
  },
  formateListLabel(val: string, list: any[], value_key = 'value', label_key = 'label'): string {
    if (!list.length) return val
    let item = list.find(i => i[value_key] === val)
    if (item) return item[label_key]
    return val
  },
  formatObject(val: object): string {
    return JSON.stringify(val || {}, null, 2)
  },
  getObjectKey(val: { [key: string]: any }, key: any): string | object {
    try {
      return val[key]
    } catch (error) {
      return val
    }
  }
}