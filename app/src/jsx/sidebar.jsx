export function RightSidebar({selectedArticles}) {
    function articleToTag(article) {
        const {source, title} = article
        const {name, icon_url} = source
        return <p>
            <img src={icon_url} alt={name} style={{width: '20px', height: '20px'}} />
            <strong>{name}</strong>: {title}
        </p>
    }

    return <div className="right-sidebar">
        {selectedArticles.map(articleToTag)}
    </div>;
}
