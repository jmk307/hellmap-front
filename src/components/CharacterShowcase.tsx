import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CharacterAvatar, EmotionCharacter } from './HellMapCharacters';
import { FearIcon, AngerIcon, LaughIcon } from './icons/EmotionIcons';

interface CharacterShowcaseProps {
  onClose?: () => void;
}

export function CharacterShowcase({ onClose }: CharacterShowcaseProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<'fear' | 'anger' | 'laugh' | null>(null);
  const [characterEmotion, setCharacterEmotion] = useState<'idle' | 'active' | 'hover'>('idle');

  const characters = [
    {
      emotion: 'fear' as const,
      name: '무서미',
      description: '개무섭한 상황을 담당하는 캐릭터예요. 무서운 일들을 수집하고 공유해요.',
      personality: '겁쟁이지만 용감한 마음을 가진 사이버 고스트',
      catchphrase: '"으아악! 이것도 제보해야겠다..."',
      color: 'var(--hellmap-fear-color)'
    },
    {
      emotion: 'anger' as const,
      name: '화나미',
      description: '개짜증나는 일들을 모아주는 캐릭터예요. 분노를 건설적으로 표현해요.',
      personality: '열정적이고 정의감 넘치는 사이버 데몬',
      catchphrase: '"이거 완전 개짜증이네! 다들 봐야 해!"',
      color: 'var(--hellmap-anger-color)'
    },
    {
      emotion: 'laugh' as const,
      name: '웃기미',
      description: '개웃긴 상황들을 찾아내는 캐릭터예요. 웃음으로 세상을 밝게 만들어요.',
      personality: '유쾌하고 긍정적인 사이버 스프라이트',
      catchphrase: '"ㅋㅋㅋㅋ 이거 대박 웃기다! 공유해야지!"',
      color: 'var(--hellmap-laugh-color)'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card 
        className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border"
        style={{
          backgroundColor: 'var(--hellmap-card-bg)',
          borderColor: 'var(--hellmap-neon-green)'
        }}
      >
        <div className="p-6 space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h2 
              className="text-2xl"
              style={{ color: 'var(--hellmap-neon-green)' }}
            >
              🤖 HellMap 캐릭터들을 만나보세요!
            </h2>
            {onClose && (
              <Button
                onClick={onClose}
                className="w-8 h-8 rounded-full border hover:scale-110 transition-transform"
                style={{
                  backgroundColor: 'var(--hellmap-card-bg)',
                  borderColor: 'var(--hellmap-border)',
                  color: 'var(--hellmap-text-muted)'
                }}
              >
                ✕
              </Button>
            )}
          </div>

          {/* 캐릭터 소개 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Card
                key={character.emotion}
                className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                  selectedCharacter === character.emotion ? 'border-opacity-100' : 'border-opacity-50'
                }`}
                style={{
                  backgroundColor: 'var(--hellmap-darker-bg)',
                  borderColor: selectedCharacter === character.emotion ? character.color : 'var(--hellmap-border)'
                }}
                onClick={() => setSelectedCharacter(character.emotion)}
              >
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CharacterAvatar
                      emotion={character.emotion}
                      size="lg"
                      interactive={true}
                      showName={false}
                    />
                  </div>
                  
                  <div>
                    <h3 
                      className="text-lg mb-2"
                      style={{ color: character.color }}
                    >
                      {character.name}
                    </h3>
                    <p 
                      className="text-sm mb-3"
                      style={{ color: 'var(--hellmap-text-secondary)' }}
                    >
                      {character.description}
                    </p>
                    <p 
                      className="text-xs italic"
                      style={{ color: 'var(--hellmap-text-muted)' }}
                    >
                      {character.personality}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 선택된 캐릭터 상세 정보 */}
          {selectedCharacter && (
            <Card
              className="p-6 border"
              style={{
                backgroundColor: 'var(--hellmap-darker-bg)',
                borderColor: characters.find(c => c.emotion === selectedCharacter)?.color
              }}
            >
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <div 
                    className="p-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--hellmap-card-bg)',
                      borderColor: characters.find(c => c.emotion === selectedCharacter)?.color,
                      width: '140px',
                      height: '140px'
                    }}
                  >
                    <EmotionCharacter
                      emotion={selectedCharacter}
                      characterEmotion={characterEmotion}
                      size={100}
                      animated={true}
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 
                      className="text-xl mb-2"
                      style={{ color: characters.find(c => c.emotion === selectedCharacter)?.color }}
                    >
                      {characters.find(c => c.emotion === selectedCharacter)?.name}의 상세 정보
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--hellmap-text-secondary)' }}
                    >
                      {characters.find(c => c.emotion === selectedCharacter)?.description}
                    </p>
                  </div>
                  
                  <div 
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--hellmap-card-bg)',
                      borderColor: 'var(--hellmap-border)'
                    }}
                  >
                    <p 
                      className="text-sm italic"
                      style={{ color: 'var(--hellmap-text-primary)' }}
                    >
                      💬 {characters.find(c => c.emotion === selectedCharacter)?.catchphrase}
                    </p>
                  </div>
                  
                  {/* 캐릭터 상태 컨트롤 */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCharacterEmotion('idle')}
                      className={`px-3 py-2 text-sm rounded border transition-all ${
                        characterEmotion === 'idle' ? 'opacity-100' : 'opacity-70'
                      }`}
                      style={{
                        backgroundColor: characterEmotion === 'idle' ? characters.find(c => c.emotion === selectedCharacter)?.color : 'var(--hellmap-card-bg)',
                        borderColor: characters.find(c => c.emotion === selectedCharacter)?.color,
                        color: characterEmotion === 'idle' ? 'black' : 'var(--hellmap-text-secondary)'
                      }}
                    >
                      대기
                    </Button>
                    <Button
                      onClick={() => setCharacterEmotion('active')}
                      className={`px-3 py-2 text-sm rounded border transition-all ${
                        characterEmotion === 'active' ? 'opacity-100' : 'opacity-70'
                      }`}
                      style={{
                        backgroundColor: characterEmotion === 'active' ? characters.find(c => c.emotion === selectedCharacter)?.color : 'var(--hellmap-card-bg)',
                        borderColor: characters.find(c => c.emotion === selectedCharacter)?.color,
                        color: characterEmotion === 'active' ? 'black' : 'var(--hellmap-text-secondary)'
                      }}
                    >
                      활성
                    </Button>
                    <Button
                      onClick={() => setCharacterEmotion('hover')}
                      className={`px-3 py-2 text-sm rounded border transition-all ${
                        characterEmotion === 'hover' ? 'opacity-100' : 'opacity-70'
                      }`}
                      style={{
                        backgroundColor: characterEmotion === 'hover' ? characters.find(c => c.emotion === selectedCharacter)?.color : 'var(--hellmap-card-bg)',
                        borderColor: characters.find(c => c.emotion === selectedCharacter)?.color,
                        color: characterEmotion === 'hover' ? 'black' : 'var(--hellmap-text-secondary)'
                      }}
                    >
                      호버
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 아이콘 vs 캐릭터 비교 */}
          <Card
            className="p-4 border"
            style={{
              backgroundColor: 'var(--hellmap-darker-bg)',
              borderColor: 'var(--hellmap-border)'
            }}
          >
            <h3 
              className="text-lg mb-4"
              style={{ color: 'var(--hellmap-neon-blue)' }}
            >
              🎨 아이콘 vs 캐릭터 비교
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 
                  className="text-sm mb-3"
                  style={{ color: 'var(--hellmap-text-primary)' }}
                >
                  기존 아이콘 스타일
                </h4>
                <div className="flex gap-6 items-center justify-center p-6 rounded-lg" style={{ backgroundColor: 'var(--hellmap-card-bg)' }}>
                  <FearIcon size={40} />
                  <AngerIcon size={40} />
                  <LaughIcon size={40} />
                </div>
              </div>
              
              <div>
                <h4 
                  className="text-sm mb-3"
                  style={{ color: 'var(--hellmap-text-primary)' }}
                >
                  새로운 캐릭터 스타일
                </h4>
                <div className="flex gap-6 items-center justify-center p-6 rounded-lg" style={{ backgroundColor: 'var(--hellmap-card-bg)' }}>
                  <EmotionCharacter emotion="fear" size={40} animated={true} />
                  <EmotionCharacter emotion="anger" size={40} animated={true} />
                  <EmotionCharacter emotion="laugh" size={40} animated={true} />
                </div>
              </div>
            </div>
          </Card>

          {/* 사용 예시 */}
          <Card
            className="p-4 border"
            style={{
              backgroundColor: 'var(--hellmap-darker-bg)',
              borderColor: 'var(--hellmap-border)'
            }}
          >
            <h3 
              className="text-lg mb-4"
              style={{ color: 'var(--hellmap-neon-purple)' }}
            >
              🚀 캐릭터 활용 예시
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mb-3">
                  <CharacterAvatar emotion="fear" size="md" interactive={true} />
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--hellmap-text-secondary)' }}
                >
                  필터 버튼에서 사용
                </p>
              </div>
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div 
                    className="p-2 rounded-full border-2"
                    style={{
                      backgroundColor: 'var(--hellmap-card-bg)',
                      borderColor: 'var(--hellmap-anger-color)'
                    }}
                  >
                    <EmotionCharacter emotion="anger" size={40} animated={true} characterEmotion="active" />
                  </div>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--hellmap-text-secondary)' }}
                >
                  지도 마커에서 사용
                </p>
              </div>
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div 
                    className="p-2 rounded-full border-2"
                    style={{
                      backgroundColor: 'var(--hellmap-card-bg)',
                      borderColor: 'var(--hellmap-laugh-color)'
                    }}
                  >
                    <EmotionCharacter emotion="laugh" size={40} animated={true} characterEmotion="hover" />
                  </div>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--hellmap-text-secondary)' }}
                >
                  게시물 아이콘에서 사용
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
} 