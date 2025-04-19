# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

# @tailwindcss/typography sugested by Gemini. Ricc just added a line here hoping for a magic behaviour. Fingers crossed.
# Anzi no: googled this and did nex line: https://discuss.rubyonrails.org/t/how-does-importmaps-rails-replace-yarn-correctly-in-rails-8/88270
# bin/importmap pin "@tailwindcss/typography"
pin "@tailwindcss/typography", to: "@tailwindcss--typography.js" # @0.5.16
pin "cssesc" # @3.0.0
pin "lodash.castarray" # @4.4.0
pin "lodash.isplainobject" # @4.0.6
pin "lodash.merge" # @4.6.2
pin "postcss-selector-parser" # @6.0.10
pin "tailwindcss/colors", to: "tailwindcss--colors.js" # @4.1.4
pin "tailwindcss/plugin", to: "tailwindcss--plugin.js" # @4.1.4
pin "util-deprecate" # @1.0.2
