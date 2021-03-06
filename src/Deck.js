import React, {useState, useEffect, useRef} from 'react'
import Card from './Card'
import axios from "axios"
import './Deck.css'

const API_BASE_URL = "https://deckofcardsapi.com/api/deck"

function Deck () {
    const [deck, setDeck] = useState(null);
    const [drawnCard, setDrawnCard] = useState([]);
    const [autoDraw, setAutoDraw] = useState(false);
    const oneSecRef = useRef(null);

    // Take Deck from API in push it to State
    useEffect(() => {
        async function loadDeck() {
            const d = await axios.get(`${API_BASE_URL}/new/shuffle/`);
            setDeck(d.data)
        }
        loadDeck();
    }, [setDeck]);

    //Draw one card at a time
    useEffect(() => {
        async function getCard() {
            let { deck_id } = deck;

            try {
                let drawRes = await axios.get(`${API_BASE_URL}/${deck_id}/draw/`)
                
                if (drawRes.data.remaining === 0) {
                    setAutoDraw(false);
                    throw new Error("No cards remaining.")
                }
                
                const card = drawRes.data.cards[0];

                setDrawnCard(d => [
                    ...d,
                    {
                        id: card.code,
                        name: card.suit + '_' + card.value,
                        image: card.image
                    }
                ]);
            } catch(err){
                alert(err);
            }
        }

        if(autoDraw && !oneSecRef.current) {
            oneSecRef.current = setInterval(async function() {
                await getCard();
            }, 1000)
        }
        return () => {
            clearInterval(oneSecRef.current);
            oneSecRef.current = null;
        };
    }, [autoDraw, setAutoDraw, deck]);

    const toggleAutoDraw = () => {
        setAutoDraw(auto => !auto)
    };

    const cards = drawnCard.map(c => (
        <Card key={c.id} cardName={c.name} image={c.image} />
    ));


    return (
        <div className="deck">
            { deck ? (
                <button className="deck-draw" onClick={toggleAutoDraw}>
                    {autoDraw ? "STOP" : "START"} DRAW CARD 
                </button> ) : null}
            <div className="deck-card-area">{cards}</div>
        </div>
        );
};

export default Deck;
