import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";

const control = "w-full";
const panel = "mt-1 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl shadow-stone-900/10";
const item = "cursor-pointer px-3 py-2.5 text-sm text-stone-700 transition hover:bg-red-50 hover:text-brand-red";

export function AppButton({ className = "", severity = "primary", ...props }) {
  const colors = severity === "secondary"
    ? "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
    : severity === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700"
      : "bg-brand-red text-white hover:bg-red-700";
  return <Button {...props} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${colors} ${className}`} />;
}

export function AppSelect({ className = "", ...props }) {
  return <Dropdown {...props} filter className={`${control} ${className}`} pt={{ root: { className: "relative flex items-center" }, input: { className: "min-w-0 flex-1 bg-transparent px-3 py-2.5 outline-none" }, trigger: { className: "flex h-11 w-11 shrink-0 items-center justify-center border-l border-stone-200 text-stone-500" }, panel: { className: panel }, filterContainer: { className: "border-b border-stone-100 p-2" }, filterInput: { className: "w-full rounded-md border border-stone-300 px-2.5 py-2 text-sm outline-none focus:border-brand-red" }, wrapper: { className: "max-h-64 overflow-auto" }, list: { className: "py-1" }, item: { className: item }, emptyMessage: { className: "px-3 py-4 text-sm text-stone-500" } }} />;
}

export function AppMultiSelect({ className = "", ...props }) {
  return <MultiSelect {...props} filter display="chip" className={`${control} ${className}`} pt={{ root: { className: "relative flex items-center" }, labelContainer: { className: "min-w-0 flex-1" }, label: { className: "block truncate px-3 py-2.5 text-sm" }, token: { className: "m-1 inline-flex max-w-[130px] items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-800" }, trigger: { className: "flex h-11 w-11 shrink-0 items-center justify-center border-l border-stone-200 text-stone-500" }, panel: { className: panel }, header: { className: "border-b border-stone-100 p-2" }, filterContainer: { className: "w-full" }, filterInput: { className: "w-full rounded-md border border-stone-300 px-2.5 py-2 text-sm outline-none focus:border-brand-red" }, wrapper: { className: "max-h-64 overflow-auto" }, list: { className: "py-1" }, item: { className: item }, checkbox: { className: "mr-2" }, emptyMessage: { className: "px-3 py-4 text-sm text-stone-500" } }} />;
}

export function AppDate({ className = "", ...props }) {
  return <Calendar {...props} dateFormat="yy-mm-dd" showIcon className={`w-full ${className}`} inputClassName="w-full" pt={{ root: { className: "w-full" }, input: { className: "h-[46px] min-w-0 w-full" }, dropdownButton: { className: "h-[46px] w-[46px] shrink-0" }, panel: { className: panel } }} />;
}
