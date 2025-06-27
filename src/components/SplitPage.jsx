import { useEffect, useRef, useState } from "react"
import "./styles/split_page.css"
import * as pdfjs from "pdfjs-dist"
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer.mjs"
import "pdfjs-dist/web/pdf_viewer.css"
import * as pdflib from "pdf-lib"
pdfjs.GlobalWorkerOptions.workerSrc =
  "../../node_modules/pdfjs-dist/build/pdf.worker.mjs";

export default function SplitPage() {
  const [pdf, setPDF] = useState(null)

  function UploadScreen() {

    function uploadPDF({ target }) {
      const fileReader = new FileReader()
      fileReader.readAsDataURL(target.files[0])
      fileReader.onload = async () => {
        const pdff = await pdfjs.getDocument(fileReader.result).promise
        setPDF(pdff)
        console.log(pdff);
      }
    }

    return (
      <>
        <div className="logo"></div>
        <div className="phrase">Upload one PDF file to split</div>
        <label htmlFor="asd" className="upload_file">
          <div className="border"></div>
          <input onChange={uploadPDF} type="file" id="asd" hidden/>
        </label>
      </>
    )
  }

  function MainScreen() {

    const pdfViewer = useRef(null)
    const scaleInputText = useRef("")
    const [fitToWidth, setFitToWidth] = useState(false)
    const [splits, setSplits] = useState([])

    useEffect(() => {
      const container = document.getElementById("viewerContainer")
      const eventBus = new pdfjsViewer.EventBus()
      pdfViewer.current = new pdfjsViewer.PDFViewer({container, eventBus})
      pdfViewer.current.setDocument(pdf)
      eventBus.on("pagesinit", () => {pdfViewer.current.currentScale = 1})
    }, [])

    function zoomIn() {
      pdfViewer.current.updateScale({drawingDelay: 400, steps: 1})
      document.getElementById("scaleInput").value = `${Math.round(pdfViewer.current.currentScale*100)}%`
    }

    function zoomOut() {
      pdfViewer.current.updateScale({drawingDelay: 400, steps: -1})
      document.getElementById("scaleInput").value = `${Math.round(pdfViewer.current.currentScale*100)}%`
    }

    function onScaleInputFocus(e) {
      scaleInputText.current = pdfViewer.current.currentScale
      e.target.select()
    } 

    // function updateScale(e) {
    //   //TODO: filter input
    //   if(!e.target.value.includes("%")) {
    //     console.log(e.target.value);
    //     pdfViewer.current.currentScale = Number(e.target.value)/100
    //     // document.getElementById("scaleInput").value = `${e.value}%`
    //   }
    // }

    function onScaleInputBlur(e) {
      if((e.type === "keydown" && e.key === "Enter") || e.type === "blur") {
        const regex = /(\d{1,3})/
        const newScale = e.target.value.match(regex)
        console.log(newScale);
        if(newScale && Number(newScale[0]) > 0 && Number(newScale[0]) < 1000) {
          pdfViewer.current.currentScale = Number(newScale[0])/100
          e.target.value = `${newScale[0]}%`
          e.target.blur()
        } else {
          pdfViewer.current.currentScale = scaleInputText.current
          e.target.value = `${Math.round(scaleInputText.current*100)}%`
        }
      }
    }

    function fitPageWidth() {
      console.log("page-width");
      pdfViewer.current.currentScaleValue = "page-width"
      document.getElementById("scaleInput").value = `${(Math.round(pdfViewer.current.currentScale*100))}%`
      setFitToWidth(false)
    }

    function fitPageHeight() {
      console.log("page-fit");
      pdfViewer.current.currentScaleValue = "page-fit"
      document.getElementById("scaleInput").value = `${(Math.round(pdfViewer.current.currentScale*100))}%`
      setFitToWidth(true)
    }

    function SplitList() {

      useEffect(() => {
        document.documentElement.style.setProperty("--menu-bar-height", `${(68+2)*splits.length+68}px`)        
      }, [splits])

      function addSplit() {
        const newSplit = {
          name: `split-${splits.length+1}`,
          from: 1,
          to: 1
        }
        console.log(newSplit)
        setSplits(splits.concat(newSplit))
      }

      function deleteSplit(index) {
        setSplits(splits.filter((split,i) => i!==index))
      }

      function fromChange(index, target) {
        setSplits(splits.map((split, i) => {

          if(i === index) {
            const newSplit = split
            newSplit.from = target.valueAsNumber
            return newSplit
          } else {
            return split
          }
        }))
      }

      function toChange(index, target) {
        setSplits(splits.map((split, i) => {

          if(i === index) {
            const newSplit = split
            newSplit.to = target.valueAsNumber
            return newSplit
          } else {
            return split
          }
        }))
      }

      function changeName(target, index) {
        setSplits(splits.map((split, i) => {
          if(i === index) {
            console.log(target.value);
            const newSplit = split
            newSplit.name = target.value
            return split
          } else {
            return split
          }
        }))
      }

      return (
        splits.length > 0 ?
        splits.map((split,i) => <>
          <div key={i} className="split_container">
            <div className="options">
              <div className="upper">
                <input type="text" onChange={({ target })=>changeName(target, i)} className="name" value={split.name} />
                <div className="pages"></div>
              </div>
              <div className="lower">
                <label htmlFor="from" >from:</label>
                <input type="number" id="from" min="1" max={pdf.numPages} onChange={({target})=>fromChange(i,target)} value={split.from}/>
                <label htmlFor="to">to:</label>
                <input type="number" id="to" min="1" max={pdf.numPages} onChange={({target})=>toChange(i,target)} value={split.to}/>
              </div>
            </div>
            <button onClick={()=>deleteSplit(i)} className="delete">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z"/></svg>
            </button>
          </div>
          <div key={i+1000} className="seperator"></div>
          {i===splits.length-1 && 
          <button key={1234567} onClick={addSplit} className="add_split">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701f1f"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
            <div>Add split</div>
          </button>}

        </>) :
          <button key={1234567} onClick={addSplit} className="add_split">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701f1f"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
            <div>Add split</div>
          </button>
      )
    }

    async function split() {
      if(splits.length < 1) return alert("You must add at least 1 split")
    
      const data = await pdf.getData()
      const sourcePDF = await pdflib.PDFDocument.load(data)
      for(let i = 0; i < splits.length; i++) {


        const splitPDF = await pdflib.PDFDocument.create()
        const indices = []
        for(let j = splits[i].from; j <=splits[i].to; j++) {
          indices.push(j-1)
        }
        const pages = await splitPDF.copyPages(sourcePDF, indices)
        
        for (const page of pages) {
          splitPDF.addPage(page)
        }
      
        const blob = new Blob([await splitPDF.save()], {type: "application/pdf"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `split-${i}.pdf`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    }

    return (
      <>
        <div className="background"></div>
        <div className="header">
          <div className="logo"></div>
          <div onClick={zoomIn} className="plus">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
          </div>
          <input id="scaleInput" onFocus={onScaleInputFocus} onBlur={onScaleInputBlur} onKeyDown={onScaleInputBlur} type="text" className="zoom_div" defaultValue="100%"/>
          <div onClick={zoomOut} className="minus">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-440v-80h560v80H200Z"/></svg>
          </div>
          <div className="fit_to">
            {fitToWidth ? 
              <svg onClick={fitPageWidth} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm640-560H160v480h640v-480Zm-640 0v480-480Zm200 360v-240L240-480l120 120Zm360-120L600-600v240l120-120Z"/></svg>
             :<svg onClick={fitPageHeight} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm480-80v-640H240v640h480Zm0-640H240h480ZM360-600h240L480-720 360-600Zm120 360 120-120H360l120 120Z"/></svg>
            }
          </div>
        </div>
        <div id="menuBar" className="menu_bar open">
          <div className="main">
            <SplitList/>
          </div>
          <div className="tail">
            <button onClick={()=>{document.getElementById("menuBar").classList.toggle("open")}}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#701f1f"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>
            </button>
          </div>
        </div>
        <div id="viewerContainer">
          <div id="viewer" className="pdfViewer"></div>
        </div>
        <div className="footer">
          <button onClick={split} className="split_button">Split</button>
        </div>
      </>
    )
  }

  return (
    <div className="split_page">
      {pdf ? <MainScreen/> : <UploadScreen/>}
    </div>
  )
}