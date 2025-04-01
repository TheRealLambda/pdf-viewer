import { useEffect, useRef, useState } from "react"
import * as pdfjs from "pdfjs-dist"
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url"
import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer.mjs"
import "pdfjs-dist/web/pdf_viewer.css"
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

import "./app.css"
export default function App() {

  const [pdfFile, setPdfFile] = useState(null)

  function UploadFile() {

    async function getPdfFile(e) {
      const a = new FileReader()
      a.onload = async function() {
        const b = new Uint8Array(this.result)
        const pdf = await pdfjs.getDocument(b).promise
        pdf.fileName = e.target.files[0].name
        setPdfFile(pdf)
      }
      a.readAsArrayBuffer(e.target.files[0])
    }

    return (

      <>
        <div className="upload_file-text">PDF <i>DIRECT</i></div>
        <div className="upload_file">
          <input hidden id="file" onChange={getPdfFile} type="file" />
          <label htmlFor="file"></label>
        </div>
      </>
    )
  }

  const sideBar = useRef(null)
  const hidea = useRef(null)

  const [zoomLevel, setZoomLevel] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [fitToWidth, setFitToWidth] = useState(false)
  const pages = useRef([])
  const scroll = useRef(0)
  const disableScroll = useRef(false)
  const curPage = useRef(1)

  function openSideBar() {
    sideBar.current ? sideBar.current.classList.add("open") : 0
    hidea.current ? hidea.current.hidden = false : 0
  }

  function closeSideBar() {
    sideBar.current ? sideBar.current.classList.remove("open") : 0
    hidea.current ? hidea.current.hidden = true : 0
    document.getElementById("infoDialogue").hidden = true
  }

  function zoomOut() {
    disableScroll.current = true
    if(zoomLevel >= 0.2+0.1) {
      // document.documentElement.style.setProperty("--zoom-level", `${zoomLevel-0.1}`)
      Array.from(document.getElementById("z").children).forEach(div => {
        div.style.setProperty("--scale-factor", `${zoomLevel-0.1}`)
      })
      document.getElementById("z").scrollTop = scroll.current*(zoomLevel-0.1)
      setZoomLevel(parseFloat((zoomLevel-0.1).toFixed(1)))
    } else {
      // document.documentElement.style.setProperty("--zoom-level", "0.2")
      Array.from(document.getElementById("z").children).forEach(div => {
        div.style.setProperty("--scale-factor", "0.2")
      })
      document.getElementById("z").scrollTop = scroll.current*(0.2)
      setZoomLevel(0.2)
    }
  }

  function zoomIn() {
    disableScroll.current = true
    if(zoomLevel <= 3-0.1) {
      // document.documentElement.style.setProperty("--zoom-level", `${zoomLevel+0.1}`)
      Array.from(document.getElementById("z").children).forEach(div => {
        div.style.setProperty("--scale-factor", `${zoomLevel+0.1}`)
      })
      document.getElementById("z").scrollTop = scroll.current*(zoomLevel+0.1)
      setZoomLevel(parseFloat((zoomLevel+0.1).toFixed(1)))
    } else {
      // document.documentElement.style.setProperty("--zoom-level", "3")
      Array.from(document.getElementById("z").children).forEach(div => {
        div.style.setProperty("--scale-factor", "3")
      })
      document.getElementById("z").scrollTop = scroll.current*(3)
      setZoomLevel(3)
    }
  }

  function renderZoomPercentage() {
    return Math.floor(zoomLevel*100)+"%"
  }

  function goToPreviousPage() {
    if(currentPage > 1) {
    document.getElementById(`page-${currentPage-1}`).scrollIntoView()
    setCurrentPage(currentPage-1)
  }
  }

  function goToNextPage() {
    if(currentPage < pdfFile._pdfInfo.numPages) {
      setCurrentPage(currentPage+1)
      document.getElementById(`page-${currentPage+1}`).scrollIntoView()
  }
  }

  function scrollToPage(pageNumber) {
    closeSideBar()
    document.getElementById(`page-${pageNumber}`).scrollIntoView()
  }

  useEffect(()=>{
    if(pdfFile) {
      document.getElementById("z").addEventListener("scroll", scrolling)
      pages.current = []

      for (let i = 1; i <= pdfFile._pdfInfo.numPages; i++) {
        async function a(){
          const container = document.createElement("div")
          container.classList.add("pdfViewer", "singlePageView")
          container.id = `page-${i}`
          document.getElementById("z").appendChild(container)

          const eventBus = new pdfjsViewer.EventBus();

          const pdfPage = await pdfFile.getPage(i);

          // Creating the page view with default parameters.
          const pdfPageView = new pdfjsViewer.PDFPageView({
            container,
            id: i,
            scale: 1,
            defaultViewport: pdfPage.getViewport({ scale: 1 }),
            eventBus,
          });
          // Associate the actual page with the view, and draw it.
          container.style.setProperty("--scale-factor", "1")
          pdfPageView.setPdfPage(pdfPage);
          pdfPageView.draw();
          pages.current.push({width: 612, height: 792})
          console.log(612, 792);
        }
        a()
        async function b(){
          const thumbnail = document.createElement("div")
          thumbnail.classList.add("thumbnail")
          thumbnail.onclick = () => scrollToPage(i)
          const page = document.createElement("div")
          page.classList.add("pdfViewer", "singlePageView", "pagee")
          thumbnail.appendChild(page)
          const pageNumber = document.createElement("div")
          pageNumber.classList.add("page_number")
          pageNumber.innerHTML = i
          thumbnail.appendChild(pageNumber)
          document.getElementById("thumbnails").appendChild(thumbnail)

          const eventBus = new pdfjsViewer.EventBus();

          const pdfPage = await pdfFile.getPage(i);

          const defaultViewport = pdfPage.getViewport({scale: 1})

          // Creating the page view with default parameters.
          const pdfPageView = new pdfjsViewer.PDFPageView({
            container: page,
            id: i,
            scale: page.clientWidth / defaultViewport.width,
            defaultViewport,
            eventBus,
          });
          // Associate the actual page with the view, and draw it.
          page.style.setProperty("--scale-factor", pdfPageView.scale.toString())
          pdfPageView.setPdfPage(pdfPage);
          pdfPageView.draw();
          
        }
        b()
      }
    }
    return ()=>{
      if(pdfFile) document.getElementById("z").removeEventListener("scroll", scrolling)
    }
  }, [pdfFile])

  useEffect(() => {
    if(pdfFile) document.getElementById("z").addEventListener("scroll", scrolling)
    return () => {
      if(pdfFile) document.getElementById("z").removeEventListener("scroll", scrolling)
    }
  }, [zoomLevel])

  function scrolling(e) {
    if(!disableScroll.current) {
      scroll.current = e.target.scrollTop
    }
    disableScroll.current = false

    const height = pages.current[0].height * zoomLevel
    console.log(e.target.scrollTop, height+20, Math.ceil(e.target.scrollTop/(height+20) + 0.5));
    setCurrentPage(Math.ceil(e.target.scrollTop/(height+20) + 0.5))
  }
  console.log(zoomLevel);
  function fitToWidthHeight() {
    if(fitToWidth) {
      let newZoomLevel
      const height = document.getElementById("z").clientHeight
      console.log(`height[${height}] = document.getElementbyId("z").clientHeight[${document.getElementById("z").clientHeight}]`);
      Array.from(document.getElementById("z").children).forEach((div,i) => {
        console.log(`<${i}>`)
        const divHeight = pages.current[i].height
        newZoomLevel = height / divHeight
        console.log(`newZoomLevel[${newZoomLevel}] = height[${height}] / divHeight[${divHeight}]`)
        console.log(`OLD::--scale-factor[${getComputedStyle(div).getPropertyValue("--scale-factor")}]`);
        div.style.setProperty("--scale-factor", `${newZoomLevel}`)
        console.log(`NEW::--scale-factor[${getComputedStyle(div).getPropertyValue("--scale-factor")}]`);
      })
      document.getElementById("z").scrollTop = scroll.current*(newZoomLevel)
      setZoomLevel(newZoomLevel)
      setFitToWidth(false)
      console.log("==============================")
    } else {
      let newZoomLevel
      const width = document.getElementById("z").clientWidth
      console.log(`width[${width}] = document.getElementbyid("z").clientWidth[${document.getElementById("z").clientWidth}]`);
      Array.from(document.getElementById("z").children).forEach((div,i) => {
        console.log(`<${i}>`)
        const divWidth = pages.current[i].width
        newZoomLevel = width / divWidth
        console.log(`newZoomLevel[${newZoomLevel}] = width[${width}] / divWidth[${divWidth}]`)
        console.log(`OLD::--scale-factor[${getComputedStyle(div).getPropertyValue("--scale-factor")}]`);
        div.style.setProperty("--scale-factor", `${newZoomLevel}`)
        console.log(`NEW::--scale-factor[${getComputedStyle(div).getPropertyValue("--scale-factor")}]`);
      })
      document.getElementById("z").scrollTop = scroll.current*(newZoomLevel)
      setZoomLevel(newZoomLevel)
      setFitToWidth(true)
      console.log("==============================")
    }
  }

  function showInfo() {
    document.getElementById("infoDialogue").hidden = false
    hidea.current.hidden = false
  }

  return(
    <div className="app">
      {pdfFile ? 
      <>
      <div ref={sideBar} className="sidebar">
        <div className="top">
          <div onClick={closeSideBar} className="burger_menu">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
          </div>
          <div className="title">{pdfFile.fileName}</div>
        </div>
        <div id="thumbnails" className="content">
        </div>
      </div>
      <div ref={hidea} onClick={closeSideBar} className="hidea" hidden></div>
      <div className="toolbar">
        <div onClick={openSideBar} className="burger_menu">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
        </div>
        <div className="zoom_options">
          <div onClick={zoomOut} className="minus">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-440v-80h560v80H200Z"/></svg>
          </div>
          <div className="zoom_percentage">{renderZoomPercentage()}</div>
          <div onClick={zoomIn} className="plus">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
          </div>
        </div>
        <div onClick={fitToWidthHeight} className="fit_to_width-height">
          {fitToWidth ? 
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm480-80v-640H240v640h480Zm0-640H240h480ZM360-600h240L480-720 360-600Zm120 360 120-120H360l120 120Z"/></svg> :
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm640-560H160v480h640v-480Zm-640 0v480-480Zm200 360v-240L240-480l120 120Zm360-120L600-600v240l120-120Z"/></svg>}
        </div>
        <div onClick={showInfo} className="info">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
        </div>
        <div id="infoDialogue" className="info_dialogue" hidden>
          {pdfFile._pdfInfo.toString()}
        </div>
      </div>
      <div className="navigation">
        <div onClick={goToPreviousPage} className="prev">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ce4d4d"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z"/></svg>
        </div>
        <div className="current">
          <div className="current_page">{currentPage}</div>
          <div className="divider"></div>
          <div className="total_pages">{pdfFile._pdfInfo.numPages}</div>
        </div>
        <div onClick={goToNextPage}className="next">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ce4d4d"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>
        </div>
      </div>
      <div id="z" className="pages">
      </div>
      </> :
      <UploadFile />}
      
      
    </div>
  )
}