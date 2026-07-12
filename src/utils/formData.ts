export function getFormData(form: HTMLFormElement): Record<string, FormDataEntryValue> {
  const formData = new FormData(form);
  const data: Record<string, FormDataEntryValue> = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });
  
  return data;
}