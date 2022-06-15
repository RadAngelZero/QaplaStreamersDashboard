/**
 * Generates a short and unguessable dynamic link for the given stream
 * @param {string} streamId Stream unique identifier
 * @param {object} streamData Data of the stream
 * @param {string} streamData.title Title of the stream
 * @param {string} streamData.description Description of the stream
 * @param {string} streamData.image Image of the stream
 * @returns {Promise<string>} Dynamic link API response
 */
export async function generateStreamDynamicLink(streamId, streamData) {
    const link = `https://qapla.app/?type=stream&streamId=${streamId}`;
    const response = await createShortDynamicLink(link, {
        socialTitle: streamData.title,
        socialDescription: streamData.description,
        socialImageLink: streamData.image
    });

    if (response) {
        return response.shortLink;
    }

    return '';
}

/**
 * Generate a short and unguessable dynamic link
 * @param {string} link Deep link
 * @param {object} socialMetaTagInfo Object with infromation to show on social media
 * @param {string} socialMetaTagInfo.socialTitle Title for the link
 * @param {string} socialMetaTagInfo.socialDescription Description for the link
 * @param {string} socialMetaTagInfo.socialImageLink Image for the link
 */
async function createShortDynamicLink(link, socialMetaTagInfo) {
    const result = await fetch('https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyAwrwwTRiyYV7-SzOvE6kEteE0lmYhBe8c', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dynamicLinkInfo: {
                domainUriPrefix: 'https://qapla.page.link',
                link,
                androidInfo: {
                    androidPackageName: 'com.qapla.gaming.app'
                },
                iosInfo: {
                    iosBundleId: 'org.Qapla.QaplaApp',
                    iosAppStoreId: '1485332229'
                },
                socialMetaTagInfo
            },
            suffix: {
                option: 'UNGUESSABLE'
            }
        })
    });

    if (result.status === 200) {
        return (await result.json());
    }

    return null;
}