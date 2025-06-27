import { useState } from "react"

import "./styles/merge_page.css"
import { PDFDocument } from "pdf-lib"
import { Link } from "react-router"
export default function MergePage() {

  const [files, setFiles] = useState([])

  async function addFile({ target }) {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(target.files[0])
    fileReader.onload = async () => {
      const pdf = await PDFDocument.load(fileReader.result) 
      pdf.name = target.files[0].name
      console.log(pdf.name);
      setFiles(files.concat(pdf))
      target.value = null
    }
  }

  async function merge() {
    if(files.length < 2) return alert("You must add at least 2 PDFs to merge")
    
    const mergedPDF = await PDFDocument.create()
    for (let i = 0; i < files.length; i++) {
      const pages = await mergedPDF.copyPages(files[i], [...Array(files[i].getPageCount()).keys()])
      for (const page of pages) {
        mergedPDF.addPage(page)
      }
      console.log(mergedPDF);
    }
    const blob = new Blob([await mergedPDF.save()], {type: "application/pdf"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "merged-pdf.pdf";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  function deleteFile(file) {
    setFiles(files.filter(f => f !== file))
  }

  function up(file) {
    if(files.indexOf(file) < 1) return
    const chosenIndex = files.indexOf(file)
    const replacedIndex = chosenIndex - 1
    const chosenFile = file
    const replacedFile = files[replacedIndex]
    const newArray = files.map((f,i) => {
      if(i === replacedIndex) {
        return chosenFile
      } else if(i === chosenIndex) {
        return replacedFile
      } else {
        return f
      }
    })
    setFiles(newArray)
  }

  function down(file) {
    if(files.indexOf(file) > files.length-2) return
    const chosenIndex = files.indexOf(file)
    const replacedIndex = chosenIndex + 1
    const chosenFile = file
    const replacedFile = files[replacedIndex]
    const newArray = files.map((f,i) => {
      if(i === replacedIndex) {
        return chosenFile
      } else if(i === chosenIndex) {
        return replacedFile
      } else {
        return f
      }
    })
    setFiles(newArray)
  }

  console.log(files, typeof files);
  return (
    <div className="merge_page">
      <div className="logo"></div>
      <div className="phrase">Merge two or more PDFs into a single PDF. The files will merge in order from top to bottom.</div>
      {files.map((file,i) => (
        <div key={i}>
          <div className="loaded_file">
            <div className="pdf_logo"></div>
            <div className="text">
              <div className="file_name">{file.name}</div>
              <div className="file_pages">{file.getPageCount()} pages</div>
            </div>
            <div className="buttons">
              <button className="delete" onClick={()=>deleteFile(file)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/></svg>
              </button>
              <div className="move">
                <button onClick={() => up(file)} className="up">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z"/></svg>
                </button>
                <button onClick={() => down(file)} className="down">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>
                </button>
              </div>
            </div>
          </div>
          <svg className="plus_icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ce4d4d"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
        </div>
      ))}
      <label htmlFor="addFile" className="add_file">
        <div className="border">
          <div className="center">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M440-440v120q0 17 11.5 28.5T480-280q17 0 28.5-11.5T520-320v-120h120q17 0 28.5-11.5T680-480q0-17-11.5-28.5T640-520H520v-120q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640v120H320q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440h120Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>
            <div>ADD PDF</div>
          </div>
        </div>
        <input onChange={addFile} type="file" id="addFile" hidden/>
      </label>
      <div className="footer">
        <Link to="/" style={{textDecoration: "none"}}>
          <button>Back</button>
        </Link>
        <button onClick={merge}>Merge</button>
      </div>
    </div>
  )
}