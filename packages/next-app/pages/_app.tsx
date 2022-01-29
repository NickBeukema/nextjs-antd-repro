import App from "next/app";
import * as React from "react";
import "./global.less"
// import styles from "./module.module.less"

class MyApp extends App {
    render() {
        return <div className="global">testing123</div>
    }
}

export default MyApp