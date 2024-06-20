import React, { useState } from 'react'
import '../Error/error.css'

function Error() {
    const [isLoading, setIsLoading] = useState(true)

    setTimeout(() => setIsLoading(false), 1000)
    return (

        <div className='error-container'>
            {isLoading ? (
                <div className='err-msg d-flex justify-content-center text-center text-white'>Loading...</div>
            ) : (
                <section className="page_403">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12 ">
                                <div className="col-sm-10 col-sm-offset-1 text-center gif-div">
                                    <div className="four_zero_four_bg">
                                        <h1 className="text-center error-num">403</h1>
                                    </div>
                                    <div className="contant_box_403">
                                        <h3 className="h2">
                                            No Trespassing
                                        </h3>
                                        <a href="/authentication" className="link_403">Authenticate</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

export default Error
