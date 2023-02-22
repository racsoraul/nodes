import NodeSystem from './NodeSystem/NodeSystem'
import classes from "./App.module.css"

function App() {
  return (
    <div className={classes.container}>
      {/* <div className={classes.profile}></div> */}
      <NodeSystem width={1000} height={750} />
    </div>
  )
}

export default App
