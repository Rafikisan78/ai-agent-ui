// Test pour vérifier le format de réponse du webhook
const WEBHOOK_URL = 'https://n8n.srv766650.hstgr.cloud/webhook/ai-agent-fiable';

async function testAllFormats() {
  console.log('🧪 Test des formats de réponse du webhook N8N\n');

  // Test 1: Texte
  console.log('📝 TEST 1: Texte');
  console.log('─'.repeat(50));
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '\\text Quelle est la capitale de la France?',
        type: 'text'
      })
    });

    const text = await response.text();
    const data = JSON.parse(text);
    const normalized = Array.isArray(data) ? data[0] : data;

    console.log('✅ Status:', response.status);
    console.log('📦 Structure:', {
      type: normalized.type,
      hasContent: !!normalized.content,
      hasResponse: !!normalized.response,
      contentLength: (normalized.content || normalized.response || '').length
    });
    console.log('💬 Réponse:', (normalized.content || normalized.response || '').substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  console.log('\n');

  // Test 2: Image
  console.log('🖼️  TEST 2: Image');
  console.log('─'.repeat(50));
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '\\image un chat astronaute',
        type: 'text'
      })
    });

    const text = await response.text();
    const data = JSON.parse(text);
    const normalized = Array.isArray(data) ? data[0] : data;

    console.log('✅ Status:', response.status);
    console.log('📦 Structure:', {
      type: normalized.type,
      hasImageUrl: !!(normalized.image_url || normalized.imageUrl || normalized.metadata?.imageUrl),
      hasContent: !!normalized.content,
      imageUrl: normalized.image_url || normalized.imageUrl || normalized.metadata?.imageUrl || 'N/A'
    });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  console.log('\n');

  // Test 3: Vidéo
  console.log('🎬 TEST 3: Vidéo');
  console.log('─'.repeat(50));
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '\\video un papillon',
        type: 'text'
      })
    });

    const text = await response.text();
    const data = JSON.parse(text);
    const normalized = Array.isArray(data) ? data[0] : data;

    console.log('✅ Status:', response.status);
    console.log('📦 Structure:', {
      type: normalized.type,
      hasVideoUrl: !!(normalized.video_url || normalized.videoUrl || normalized.metadata?.videoUrl),
      hasTaskId: !!(normalized.task_id || normalized.taskId || normalized.metadata?.taskId),
      status: normalized.status || 'N/A',
      videoUrl: normalized.video_url || normalized.videoUrl || normalized.metadata?.videoUrl || 'N/A',
      taskId: normalized.task_id || normalized.taskId || normalized.metadata?.taskId || 'N/A'
    });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  console.log('\n✨ Tests terminés!');
}

testAllFormats();
