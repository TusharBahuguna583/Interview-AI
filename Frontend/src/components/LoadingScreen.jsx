import React from 'react'

const LoadingScreen = ({
    title = 'Loading...',
    message = 'Getting everything ready.',
    label = 'Please wait'
}) => {
    return (
        <main className='loading-screen' aria-busy='true' aria-live='polite'>
            <div className='loading-screen__panel'>
                <div className='loading-screen__mark' aria-hidden='true'>
                    <span />
                    <span />
                </div>
                <p className='loading-screen__label'>{label}</p>
                <h1>{title}</h1>
                {message && <p className='loading-screen__message'>{message}</p>}
                <div className='loading-screen__bar' aria-hidden='true'>
                    <span />
                </div>
            </div>
        </main>
    )
}

export default LoadingScreen
