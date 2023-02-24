import NodesSystem from './NodesSystem/NodesSystem'
import classes from "./App.module.css"

function App() {
  return (
    <div className={classes.container}>
      <NodesSystem width={1000} height={750} />
    </div>
  )
}

export default App
