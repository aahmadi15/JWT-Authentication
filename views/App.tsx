import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {createRoot} from 'react-dom/client'

import './App.css';

function HomePage(){

}

async function ConferencePage(){
    return (<Router>
        <Routes>
            <Route path = "/" element = {<HomePage />} />

        </Routes>
    </Router>);
        
}

export default ConferencePage;

const domNode = document.body.innerHTML = '<div id = "app"> </div>';

const root = createRoot(domNode)

root.render(<ConferencePage/>);
