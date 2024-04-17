/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-04-16 16:29:51
 * @FilePath: \react-ts-antd\src\pages\About\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import './style.scss'; 

interface Game {
  id: number;
  name: string;
  image: string;
  tags: string[];
  description: string;
}
const game: Game = {
  "id": 1,
  "name": "原神",
  "image": "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
  "tags": ["二次元", "开放世界", "RPG"],
  "description": "《原神》是由中国大陆游戏开发商miHoYo制作并发行的一款开放世界动作角色扮演游戏。"
}

const GameDetail: React.FC = () => {
  return (
    <div className="container">
      <div className="game-detail">
        <img src={game.image} alt={game.name} />
        <h2>{game.name}</h2>
        <div className="tags">
          {game.tags.map((tag, index) => (
            <span key={index}>{tag}</span>
          ))}
        </div>
        <p>{game.description}</p>
      </div>
    </div>
  );
};

export default GameDetail;
