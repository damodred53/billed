
export const formatChecker = ( fileExtension) => {

    const fileMain = this.document.querySelector(`input[data-testid="file"]`)
    const errorMessage = this.document.querySelector('.error_format_paragraph');

    const isGoodFormat = (fileExtension) => ['jpeg', 'jpg', 'png'].includes(fileExtension);

    if (!isGoodFormat(fileExtension)) {
        errorMessage.style.display = "block";
        fileMain.value = null
        return
      } else {
          errorMessage.style.display = "none"
      }
}
    