import React from 'react'
import './layout.css'
import bgImage from '../../../Assests/bgimage12046-5l2i-2000w.png'

function Layout({ mainHeading, breadcrumbs }) {

    return (
        <div>
            <section className="bg-image-section" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="container text-end d-flex flex-wrap align-items-center justify-content-end">
                    <div className="col-first text-white heading-container">
                        <h1 className="display-4">{mainHeading}</h1>
                        <nav className="breadcrumb align-items-center bg-transparent">
                            {breadcrumbs && breadcrumbs.map((data, index) => (
                                <a key={index} className="breadcrumb-item text-white" href={data.path}>{data.name}</a>
                            ))}
                            <span className="breadcrumb-item active text-white">{mainHeading}</span>
                        </nav>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Layout
