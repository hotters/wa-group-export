export function downloadGroup(data: any[], name: string) {
  const csv = data
    .reduce(
      (prev, item) => {
        prev.push(
          Object.values(item)
            .map((value: string) => (value?.includes(',') ? `"${value}"` : value))
            .join(',')
        );
        return prev;
      },
      [{ ...Object.keys(data[0]) }]
    )
    .join('\n');

  const url = window.URL.createObjectURL(new Blob([csv]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${name}.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
}
