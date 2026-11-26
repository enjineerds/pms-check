Pod::Spec.new do |s|
  s.name           = 'VisionOcr'
  s.version        = '0.0.1'
  s.summary        = 'Apple Vision text recognition with boxes and confidence'
  s.author         = ''
  s.homepage       = 'https://example.invalid'
  s.license        = 'UNLICENSED'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
end
