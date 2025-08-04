
import { Card } from './ui/card';

export function WeeklyReport() {
  const weeklyStats = [
    {
      id: 1,
      emoji: '🏆',
      title: '이번 주 가장 헬한 장소',
      content: '강남역 일대',
      description: '총 127개의 제보가 몰렸습니다',
      color: 'var(--hellmap-hot-pink)'
    },
    {
      id: 2,
      emoji: '⏰',
      title: '헬타임 피크 시간',
      content: '오후 6-8시',
      description: '퇴근 러시아워가 가장 위험해요',
      color: 'var(--hellmap-neon-yellow)'
    },
    {
      id: 3,
      emoji: '😱',
      title: '이번 주 공포 1위',
      content: '새벽 지하철',
      description: '32건의 무서운 경험담',
      color: 'var(--hellmap-hot-pink)'
    },
    {
      id: 4,
      emoji: '😡',
      title: '진상 만남의 성지',
      content: '대형마트 계산대',
      description: '45건의 진상 목격담',
      color: 'var(--hellmap-neon-yellow)'
    },
    {
      id: 5,
      emoji: '🤣',
      title: '웃음 포인트',
      content: '배달 실수담',
      description: '89건의 황당한 경험',
      color: 'var(--hellmap-light-pink)'
    },
    {
      id: 6,
      emoji: '📊',
      title: '이번 주 총 제보',
      content: '1,234건',
      description: '지난 주 대비 23% 증가',
      color: 'black'
    }
  ];

  return (
    <div className="bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl mb-4">
            <span className="hellmap-text-shadow" style={{ color: 'var(--hellmap-neon-yellow)' }}>
              📈 이번 주 헬리포트
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            지난 7일간의 헬조선 현황을 정리했습니다
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyStats.map((stat) => (
            <Card 
              key={stat.id} 
              className="bg-white text-black p-6 hover:scale-105 transition-transform duration-300 hellmap-neon-glow"
              style={{ 
                borderTop: `4px solid ${stat.color}`,
                boxShadow: `0 0 15px ${stat.color}40`
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{stat.emoji}</div>
                <h3 className="text-lg mb-2 text-gray-600">{stat.title}</h3>
                <div 
                  className="text-2xl mb-2 hellmap-text-shadow"
                  style={{ color: stat.color }}
                >
                  {stat.content}
                </div>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Fun Facts Section */}
        <div className="mt-12 bg-gradient-to-r from-pink-900 to-yellow-900 rounded-lg p-6">
          <h3 className="text-2xl text-center mb-6">
            <span style={{ color: 'var(--hellmap-neon-yellow)' }}>🎯 이번 주 헬팩트</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-black bg-opacity-50 rounded-lg p-4">
              <div className="text-2xl mb-2">🕐</div>
              <p className="text-sm">가장 많은 제보가 올라온 시간</p>
              <p className="text-lg" style={{ color: 'var(--hellmap-hot-pink)' }}>밤 11시 42분</p>
            </div>
            
            <div className="bg-black bg-opacity-50 rounded-lg p-4">
              <div className="text-2xl mb-2">📍</div>
              <p className="text-sm">헬지수가 가장 높은 역</p>
              <p className="text-lg" style={{ color: 'var(--hellmap-neon-yellow)' }}>홍대입구역</p>
            </div>
            
            <div className="bg-black bg-opacity-50 rounded-lg p-4">
              <div className="text-2xl mb-2">🔥</div>
              <p className="text-sm">가장 많이 사용된 키워드</p>
              <p className="text-lg" style={{ color: 'var(--hellmap-light-pink)' }}>"진짜 미친"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}