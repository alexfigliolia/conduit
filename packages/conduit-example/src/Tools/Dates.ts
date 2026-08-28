import { create, type Record } from "temporal-polyfill/fns/PlainDate";

export class Dates {
  public static from(date: Date) {
    return create(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  public static is(date1: Record, date2: Record) {
    return (
      date1.year === date2.year &&
      date1.day === date2.day &&
      date1.month === date2.month
    );
  }
}
