export const converters = [
    function getAirtablePreviewUrl(url) {
        const match = url.match(/airtable\.com(\/embed)?\/(shr[A-Za-z0-9]{14}.*)/);
        if (match) {
            return `https://airtable.com/embed/${match[2]}`;
        }

        // URL isn't for an Airtable share
        return null;
    },
    function getBCATPreviewUrl(url) {
        const match = url.match(/shinyapps\.io(\/)?\/([A-Za-z0-9].*)/);
        if (match) {
            console.log(url);
            return `https://ruralinnovation.shinyapps.io/${match[2]}`;
        }

        // URL isn't for an Airtable share
        return null;
    },
    function getYoutubePreviewUrl(url) {
        // Standard youtube urls, e.g. https://www.youtube.com/watch?v=KYz2wyBy3kc
        let match = url.match(/youtube\.com\/.*v=([\w-]+)(&|$)/);

        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }

        // Shortened youtube urls, e.g. https://youtu.be/KYz2wyBy3kc
        match = url.match(/youtu\.be\/([\w-]+)(\?|$)/);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }

        // Youtube playlist urls, e.g. youtube.com/playlist?list=KYz2wyBy3kc
        match = url.match(/youtube\.com\/playlist\?.*list=([\w-]+)(&|$)/);
        if (match) {
            return `https://www.youtube.com/embed/videoseries?list=${match[1]}`;
        }

        // URL isn't for a youtube video
        return null;
    },
    function getVimeoPreviewUrl(url) {
        const match = url.match(/vimeo\.com\/([\w-]+)(\?|$)/);
        if (match) {
            return `https://player.vimeo.com/video/${match[1]}`;
        }

        // URL isn't for a Vimeo video
        return null;
    },
    function getSpotifyPreviewUrl(url) {
        // Spotify URLs for song, album, artist, playlist all have similar formats
        let match = url.match(/spotify\.com\/(track|album|artist|playlist)\/([\w-]+)(\?|$)/);
        if (match) {
            return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
        }

        // Spotify URLs for podcasts and episodes have a different format
        match = url.match(/spotify\.com\/(show|episode)\/([\w-]+)(\?|$)/);
        if (match) {
            return `https://open.spotify.com/embed-podcast/${match[1]}/${match[2]}`;
        }

        // URL isn't for Spotify
        return null;
    },
    function getSoundcloudPreviewUrl(url) {
        // Soundcloud url's don't have a clear format, so just check if they are from soundcloud and try
        // to embed them.
        if (url.match(/soundcloud\.com/)) {
            return `https://w.soundcloud.com/player/?url=${url}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
        }

        // URL isn't for Soundcloud
        return null;
    },
    function getFigmaPreviewUrl(url) {
        // Figma has a regex they recommend matching against
        if (
            url.match(
                /(https:\/\/([\w.-]+\.)?)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/,
            )
        ) {
            return `https://www.figma.com/embed?embed_host=astra&url=${url}`;
        }

        // URL isn't for Figma
        return null;
    },
    function getLoomPreviewUrl(url) {
        const match = url.match(/loom\.com\/share\/([\w-]+)(\?|$)/);
        if (match) {
            return `https://loom.com/embed/${match[1]}`;
        }

        // URL isn't for a Loom video
        return null;
    },
    function getGooglePreviewUrl(url) {
        // Google URLs for Google Drive files, Docs, Sheets, and Slides all have similar formats
        const match = url.match(
            /(docs|drive)\.google\.com\/(document|spreadsheets|presentation|file)\/d\/([\w-]+)/,
        );
        if (match) {
            return `https://${match[1]}.google.com/${match[2]}/d/${match[3]}/preview`;
        }

        // Google Drive folders have a different format and embed URL.
        const driveMatch = url.match(/drive\.google\.com\/drive\/folders\/([\w-]+)/);
        if (driveMatch) {
            return `https://drive.google.com/embeddedfolderview?id=${driveMatch[1]}`;
        }

        // URL isn't for a supported Google url format
        return null;
    },
];
