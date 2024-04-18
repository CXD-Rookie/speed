/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-04-18 19:01:27
 * @FilePath: \speed\src\pages\GameList\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useRef, useEffect } from "react";
// import { post } from "@/api/api";
import { useNavigate } from "react-router-dom";

import "./style.scss";

interface Game {
  id: number;
  name: string;
  image: string;
  tags: string[];
}

interface GamesTitleProps {
  label: string;
  key: string;
}

const games: Game[] = [
  {
    id: 1,
    name: "原神",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["二次元", "开放世界", "RPG"],
  },
  {
    id: 2,
    name: "英雄联盟",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["MOBA", "竞技", "策略"],
  },
  {
    id: 3,
    name: "绝地求生",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["FPS", "射击", "生存"],
  },
  {
    id: 4,
    name: "我的世界",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["沙盒", "建造", "冒险"],
  },
  {
    id: 5,
    name: "王者荣耀",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["MOBA", "竞技", "手游"],
  },
  {
    id: 6,
    name: "Apex英雄",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["FPS", "射击", "Battle Royale"],
  },
  {
    id: 7,
    name: "糖豆人：终极淘汰赛",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["休闲", "多人", "竞技"],
  },
  {
    id: 8,
    name: "怪物猎人：崛起",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["休闲", "多人", "竞技"],
  },
  {
    id: 9,
    name: "暗黑破坏神4",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["休闲", "多人", "竞技"],
  },
  {
    id: 10,
    name: "艾尔登法环",
    image:
      "https://gameplus-platform.cdn.bcebos.com/gameplus-platform/upload/file/img/f6ea86cc2b6189959d7b1309d7a209e7/f6ea86cc2b6189959d7b1309d7a209e7.jpg",
    tags: ["休闲", "多人", "竞技"],
  },
];

const gamesTitle: GamesTitleProps[] = [
  {
    key: "1",
    label: "热门游戏",
  },
  {
    key: "2",
    label: "近期推荐",
  },
  {
    key: "3",
    label: "休闲娱乐",
  },
  {
    key: "4",
    label: "游戏平台",
  },
];

const GameListPage: React.FC = () => {
  const navigate = useNavigate();
  const targetDivRef = useRef(null);

  const [divWidth, setDivWidth] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const game_gap = (divWidth % 200) / Math.floor(divWidth / 200);

  const handleMouseEnter = (gameId: number) => {
    setHoveredCard(gameId);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null); // 隐藏所有浮动层
  };

  const handleAccelerateClick = () => {
    // 处理立即加速按钮的点击事件
    console.log("立即加速");
    navigate("/gameDetail");
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === targetDivRef.current) {
          setDivWidth(entry.contentRect.width);
        }
      }
    });

    if (targetDivRef.current) {
      resizeObserver.observe(targetDivRef?.current);
    }

    return () => {
      if (targetDivRef?.current) {
        resizeObserver.unobserve(targetDivRef?.current);
      }
    };
  }, [targetDivRef]);

  return (
    <div className="game-list-module-container">
      <div className="game-title-box">
        {gamesTitle.map((item) => (
          <div key={item?.key} className="game-label">
            {item?.label}
          </div>
        ))}
      </div>
      <div
        className="game-list"
        style={game_gap ? { columnGap: game_gap } : {}}
        ref={targetDivRef}
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onMouseEnter={() => handleMouseEnter(game.id)}
            onMouseLeave={handleMouseLeave} // 修改这里
          >
            <img src={game.image} alt={game.name} />
            <div className="card-text-box">
              <h3>{game.name}</h3>
              <p>{game.tags.join(", ")}</p>
            </div>
            <button
              className="accelerate-button"
              style={{ display: hoveredCard === game.id ? "block" : "none" }}
              onClick={handleAccelerateClick}
            >
              立即加速
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameListPage;
