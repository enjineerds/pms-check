Pod::Spec.new do |s|
  s.name           = 'QuoteOcr'
  s.version        = '1.0.0'
  s.summary        = 'Reads a quote photo with Apple Vision'
  s.author         = ''
  s.homepage       = 'https://github.com/enjineerds/pms-check'
  s.license        = 'UNLICENSED'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
end
