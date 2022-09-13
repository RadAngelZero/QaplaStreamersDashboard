/**
 * Creates a deep link with branch API
 * @param {string} streamerId Streamer identifier
 * @param {string} qreatorCode Qreator code (reference for Qapla web)
 * @param {string} alias Alias for url (http://qapla.app.link/${alias})
 * @returns Branch API response
 */
export async function createLink(streamerId, qreatorCode, alias) {
    const response = await fetch('https://api2.branch.io/v1/url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            branch_key: 'key_live_bg6p6DgKXOhIDT1ShRTQijhcxslLZvQ2',
            alias,
            data: {
                $desktop_url: `https://web.qapla.gg/?qreatorCode=${qreatorCode}`,
                streamerId
            }
        })
    });

    return response;
}