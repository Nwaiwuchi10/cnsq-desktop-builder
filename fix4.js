const fs = require('fs');
const path = require('path');

const filePath = 'src/pages/chatForum/Channels/ChannelConverationView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forwarding Modal */}`,
  `                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            ) : (
              <div className="p-3 pb-safe pb-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0 text-center text-sm text-gray-500">
                Only admins can send messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forwarding Modal */}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax 4');
