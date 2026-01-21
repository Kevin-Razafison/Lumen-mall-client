import React from 'react'

const header = () => {
    return(
        <header className='header-container'>
            <Logo />
            <SearchBar />
            <div className='nav-action'>
                <DeliveryStatus country="Madagascar" />
                <UserAccount />
                <CartWidget itemCount={0} />
            </div>
        </header>   
    )
}