import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { GiphyFetch } from "@giphy/js-fetch-api";
import { saveGiphyText } from '../../services/database';

const gf = new GiphyFetch("1WgsSOSfrTXTN4IGMMuhajM7WsfxoSdq");

const GiphyTextGenerator = () => {
    const { uid, text } = useParams();

    useEffect(() => {
        async function getGiphyText() {
            try {
                const result = await gf.animate(text, {
                    limit: 50
                });
                const data = [];
                result.data.forEach((text) => {
                    if (text.images.fixed_width && text.images.original) {
                        data.push({
                            images: {
                                fixed_height_small: text.images.fixed_width,
                                original: text.images.original
                            }
                        });
                    }
                });

                saveGiphyText(uid, data);
            } catch (error) {
                console.error("animate", error);
            }
        }
        if (uid && text) {
            getGiphyText();
        }

    }, [uid, text]);
    return (
        <></>
    );
}

export default GiphyTextGenerator;