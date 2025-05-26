import * as R from 'ramda'

import {useState} from 'react'

import {categoryToColor} from './color'

export function TopLeftSidebar({searchQuery, setSearchQuery, showCategories, setShowCategories}) {
    const [searchQueryInput, setsearchQueryInput] = useState(searchQuery)

    function handleKeyUp(event) {
        if (event.key === 'Enter') {
            setSearchQuery(searchQueryInput)
        }
    }

    const categories = Object.keys(showCategories)
    function categoryCheckbox(category) {
        const color = categoryToColor(category)
        const style = {backgroundColor: color, width: '20px', height: '20px', display: 'inline-block' }
        return <div key={category}>
            <input type='checkbox' checked={showCategories[category]}
                   onChange={e => setShowCategories(R.assoc(category, e.target.checked))}/>
            {' '}
            <div style={style}></div>
            {' '}
            <span>{category}</span>
        </div>
    }

    return <div className={'sidebar top-left-sidebar'}>
        <input type={'text'} value={searchQueryInput} onChange={e => setsearchQueryInput(e.target.value)}
            onKeyUp={handleKeyUp} placeholder={'Search + Enter'}/><br/>
        <br/>
        {categories.map(categoryCheckbox)}
    </div>
}

export function TopRightSidebar({selectedArticles}) {
    function googleSearchUrl(searchText) {
        const query = searchText.split(' ').join('+')
        return `https://www.google.com/search?q=${query}`
    }

    function articleToTag(article) {
        const {source, title} = article
        const {name, icon_url} = source
        return <p>
            <a href={googleSearchUrl(`${source.name} ${title}`)} target={'_blank'} rel='noreferrer'>
                <img src={icon_url} alt={name} style={{width:'20px', height:'20px'}}/> {' '}
                <span>
                    <strong>{name}</strong>: {title}
                </span>
            </a>
        </p>
    }

    return <div className='sidebar top-right-sidebar'>
        {selectedArticles.map(articleToTag)}
    </div>
}

export function BottomRightSidebar({time}) {
    const date = new Date(time)
    const timeString = date.toLocaleString()

    return <div className='sidebar bottom-right-sidebar'>
        <span className={'right'}>Last updated: {timeString}</span>
    </div>
}
