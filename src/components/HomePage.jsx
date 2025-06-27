import "./styles/home_page.css"
import { Link } from "react-router"

export default function HomePage() {

  return (
    <div className="home_page">
      <div className="logo"></div>
      <div className="phrase t14r">Lightweight client-based PDF toolkit. No files are stored to a remote server, all operations are done exclusively on the user's machine. If you wish to continue editing offline, <Link to="/how-to-save-page">save this page</Link>.</div>
      <Link to="/edit-pdf" style={{textDecoration: "none", opacity: "0.5", pointerEvents: "none"}}>
        <button>View/Edit PDF</button>
      </Link>
      <Link to="/merge-pdf" style={{textDecoration: "none"}}>
        <button>Merge PDFs</button>
      </Link>
      <Link to="/split-pdf" style={{textDecoration: "none"}}>
        <button>Split PDF</button>
      </Link>
      <Link to="/extract-pages" style={{textDecoration: "none", opacity: "0.5", pointerEvents: "none"}}>
        <button>Extract Pages</button>
      </Link>
      <Link to="/reorder-pages" style={{textDecoration: "none", opacity: "0.5", pointerEvents: "none"}}>
        <button>Reorder Pages</button>
      </Link>
      <Link to="/rotate-pages" style={{textDecoration: "none", opacity: "0.5", pointerEvents: "none"}}>
        <button>Rotate Pages</button>
      </Link>
      <Link to="/add-page-numbers" style={{textDecoration: "none", opacity: "0.5", pointerEvents: "none"}}>
        <button>Add Page Numbers</button>
      </Link>
      <Link to="/add-watermark" style={{textDecoration: "none", opacity: "0.5", pointerEvents: "none"}}>
        <button>Add Watermark</button>
      </Link>
      
    </div>
  )
}