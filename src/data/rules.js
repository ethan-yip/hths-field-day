export const RULES = [
  {
    sport: 'Flag Football',
    emoji: '🏈',
    sections: [
      {
        title: 'Overall',
        body: 'Max 8 players on offense and defense at any time. Subs can occur between any plays and during timeouts. Captains are responsible for calling subs and ensuring even play time.',
      },
      {
        title: 'Time',
        body: '15–20 min running clock kept by refs. Each team gets 2 timeouts per half (~30 sec each, clock stops).',
      },
      {
        title: 'Starting the Game',
        body: 'Coin toss — winner decides to receive (start 1st half with ball) or defer (start 2nd half with ball).',
      },
      {
        title: 'Starting a Drive',
        body: 'New drive begins at the start of each half or after a turnover. After a half: 5 steps out of the end zone. After turnover: back to the last closest quarter marker.',
      },
      {
        title: 'Individual Plays',
        body: 'QB must hold the ball and yell "Hike!" to start. Offense can throw or run. After a full 5-Mississippi count, defense can blitz and try to pull the QB\'s flag (sack). If being blitzed, QB may also run. Play ends when the ball carrier\'s flag is pulled or the ball touches the ground. No covering or blocking flags.',
      },
      {
        title: 'Scoring & Downs',
        body: '4 tries to get a first down (no punting). First downs are achieved by crossing the next quarter marker. Touchdown = 6 pts. Safety (offense in their own end zone) = 2 pts for defense.',
      },
      {
        title: 'Turnovers',
        body: 'Ball turns over if offense fails to reach the next quarter marker in 4 tries, or on an interception. No fumbles — any dropped ball is ruled dead. If a defender catches the ball and reaches the end zone, it\'s a pick-six (6 pts).',
      },
      {
        title: 'Penalties',
        body: 'Flag blocking, holding, tackling, offsides, tripping, pass interference, and blocking all result in a 5-step penalty.',
      },
    ],
  },
  {
    sport: 'Kickball',
    emoji: '🔴',
    sections: [
      {
        title: 'Overall',
        body: '8–11 players per team. One team fields, the other kicks. Score a run by safely reaching home plate before the end of an inning. Younger team kicks first.',
      },
      {
        title: 'Timing',
        body: 'One inning = both teams kick and field. Teams swap after 3 outs or 5 runs scored.',
      },
      {
        title: 'Outs',
        body: '3 strikes or 3 fouls = out. Strike = pitch not kicked and not a ball. Foul = ball kicked into foul territory. Also out if: caught by fielder, tagged with ball between bases, or forced out at a base.',
      },
    ],
  },
  {
    sport: 'Soccer',
    emoji: '⚽',
    sections: [
      {
        title: 'Overall',
        body: '8v8 with subs, one designated goalie per team. Subs called by refs or by players needing a break.',
      },
      {
        title: 'Penalties',
        body: 'Hand ball, holding, tripping, and high kicks all result in a direct free kick for the opposing team. No goal kicks or corner kicks — treated as throw-ins. No slide tackling.',
      },
      {
        title: 'Goalies',
        body: 'Goalies may use their hands only inside the 18-yard box.',
      },
      {
        title: 'Scoring',
        body: 'Goal counts when the ball fully crosses the goal line.',
      },
    ],
  },
  {
    sport: 'Ultimate Frisbee',
    emoji: '🥏',
    sections: [
      {
        title: 'Overall',
        body: '2 games running simultaneously. 8v8 on a field with subs.',
      },
      {
        title: 'Starting',
        body: 'Both teams line up on their end zone. Defense pulls (throws) the disc to offense to begin each point.',
      },
      {
        title: 'Scoring',
        body: 'Completing a pass in the defense\'s end zone scores a point.',
      },
      {
        title: 'Movement',
        body: 'Disc can be advanced by completing passes. Players may not run with the disc. Thrower has 5 seconds to throw (marker counts stall). Disc may be thrown in any direction.',
      },
    ],
  },
  {
    sport: 'Basketball',
    emoji: '🏀',
    sections: [
      {
        title: 'Overall',
        body: 'Half-court, 5v5. Subs called by team captains. Call your own fouls and violations.',
      },
      {
        title: 'Scoring',
        body: 'Inside arc = 1 pt. Outside arc = 2 pts. After a made basket, ball is checked up at the top of the arc by the team that was on defense.',
      },
      {
        title: 'Violations',
        body: 'Traveling, carrying/palming, double dribble, held ball, goaltending, and backcourt violation all result in the ball being awarded to the other team.',
      },
      {
        title: 'Checking Up',
        body: 'Ball is checked up after every out of bounds, foul, and made shot (loser\'s ball).',
      },
    ],
  },
  {
    sport: 'Volleyball',
    emoji: '🏐',
    sections: [
      {
        title: 'Overall',
        body: '6 players per team on court. Rally scoring — points scored every rally regardless of who serves.',
      },
      {
        title: 'Serving',
        body: 'No second serves — fault = turnover + point to other team. Serves may hit the net and go over. Server rotates when possession changes.',
      },
      {
        title: 'Play Rules',
        body: '3 hits per side. Blocks don\'t count as a hit. Same player can\'t hit twice in a row (unless first hit was a block). Line is in. Ball may be played off the net.',
      },
      {
        title: 'Scoring',
        body: 'First to 25 wins (win by 2), or most points at time\'s end.',
      },
    ],
  },
  {
    sport: 'Dodgeball',
    emoji: '🎯',
    sections: [
      {
        title: 'Overall',
        body: 'Boundaries same as basketball court. Eliminate all opposing players or have most players remaining when time expires.',
      },
      {
        title: 'Opening',
        body: 'Balls on center line. Players start behind baseline and wait for whistle. Only one ball per player, must be taken behind the free-throw line before throwing.',
      },
      {
        title: 'Rules',
        body: 'Constant throwing required — no hoarding balls. All throws must cross the midcourt line. No spiking at floor, ceiling, or back wall. Ball hitting any part of body/clothing = out. Headshots don\'t count. Catching opponent\'s live ball = thrower is out.',
      },
      {
        title: 'Re-entry',
        body: 'Out players line up on the sideline in order. They re-enter at ref\'s signal in order or when a teammate catches a live ball.',
      },
    ],
  },
  {
    sport: 'Pickleball',
    emoji: '🏓',
    sections: [
      {
        title: 'Overall',
        body: 'Played as doubles (most common) or singles. Same court and rules for both.',
      },
      {
        title: 'The Serve',
        body: 'Paddle must move upward at contact, contact below waist, paddle head below wrist. Drop serve also allowed. Serve diagonally crosscourt into the opposite diagonal box. One serve attempt only.',
      },
      {
        title: 'Service Sequence',
        body: 'Both players on the serving team serve and score until a fault (except at game start). First serve from right side. Point scored = server switches sides. When server 1 faults, server 2 serves from correct side. Side-out = service goes to opponents, starting from right.',
      },
      {
        title: 'Scoring',
        body: 'First to 11 points wins.',
      },
    ],
  },
  {
    sport: 'Tug of War',
    emoji: '💪',
    sections: [
      {
        title: 'Overall',
        body: '15 players per team. First team to pull the center of the rope over the line wins.',
      },
    ],
  },
]
