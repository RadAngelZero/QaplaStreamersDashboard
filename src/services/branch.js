export function createLink(streamerId, alias, onSuccess) {
    branch.link({
        alias,
        data: {
            '$og_title': 'Qapla Test link',
            '$og_description': 'Qapla Test link description',
            '$og_image_url': 'https://play-lh.googleusercontent.com/SDf-cdu1zjcFDYM8yyGCxGEKJU8WLy1q34aY8PRMfDUmEW9gbkS3jJ801w86iw5kLBo',
            '$twitter_title': 'Qapla Test link',
            '$twitter_description': 'Qapla Test link description',
            '$twitter_image_url': 'https://play-lh.googleusercontent.com/SDf-cdu1zjcFDYM8yyGCxGEKJU8WLy1q34aY8PRMfDUmEW9gbkS3jJ801w86iw5kLBo',
            streamerId
          }
    }, (error, link) => {
        console.log(error);
        if (!error) {
            onSuccess(link);
        }
    });
}