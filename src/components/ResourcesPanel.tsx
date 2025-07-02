import React from 'react';
import { ExternalLink, Book, GraduationCap, ShoppingCart, Heart, Users } from 'lucide-react';

const ResourcesPanel: React.FC = () => {
  const resources = [
    {
      title: 'New Hope West',
      description: 'Our church community where faith comes alive',
      url: 'https://www.newhopewest.com',
      icon: Heart,
      color: 'bg-blue-500',
      features: ['Sunday Services', 'Community Events', 'Prayer Requests', 'Ministries']
    },
    {
      title: 'New Hope Christian College',
      description: 'Equipping students for ministry and life',
      url: 'https://www.newhope.edu',
      icon: GraduationCap,
      color: 'bg-green-500',
      features: ['Degree Programs', 'Online Courses', 'Campus Life', 'Admissions']
    },
    {
      title: 'Life Resources',
      description: 'Christian books, journals, and study materials',
      url: 'https://www.liferesources.cc',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      features: ['Physical SOAP Journal', 'Study Guides', 'Christian Books', 'Gift Items']
    }
  ];

  const additionalResources = [
    {
      title: 'Bible Study Tools',
      items: [
        { name: 'Bible Gateway', url: 'https://www.biblegateway.com', description: 'Multiple translations and study tools' },
        { name: 'Blue Letter Bible', url: 'https://www.blueletterbible.org', description: 'Original language tools and commentaries' },
        { name: 'YouVersion Bible App', url: 'https://www.bible.com', description: 'Mobile Bible with reading plans' }
      ]
    },
    {
      title: 'Study Methods',
      items: [
        { name: 'SOAP Method Guide', url: '#', description: 'Learn more about Scripture, Observation, Application, Prayer' },
        { name: 'Inductive Bible Study', url: '#', description: 'Deeper study techniques for understanding Scripture' },
        { name: 'Journaling Tips', url: '#', description: 'How to effectively journal your spiritual journey' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Resources */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {resources.map((resource, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className={`${resource.color} p-4`}>
              <div className="flex items-center gap-3 text-white">
                <resource.icon size={24} />
                <h3 className="font-semibold text-lg">{resource.title}</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">{resource.description}</p>
              
              <ul className="space-y-2 mb-6">
                {resource.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Visit Website
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Resources */}
      <div className="grid gap-6 md:grid-cols-2">
        {additionalResources.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Book size={20} />
              {section.title}
            </h3>
            
            <div className="space-y-4">
              {section.items.map((item, idx) => (
                <div key={idx} className="border-l-4 border-primary-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    {item.url !== '#' && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Community Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Users size={24} />
          <h3 className="text-xl font-semibold">Join Our Community</h3>
        </div>
        
        <p className="mb-6 opacity-90">
          Connect with fellow believers, share your journey, and grow together in faith. 
          Our community is here to support and encourage you every step of the way.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.newhopewest.com/connect"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <Heart size={16} />
            Connect with Us
          </a>
          <a
            href="https://newhopewest.com/lifegroups/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors inline-flex items-center gap-2"
          >
            <Users size={16} />
            Small Groups
          </a>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Technical Support</h4>
            <p className="text-sm text-gray-600">
              Having trouble with the app? Contact our support team for assistance.
            </p>
            <a href="mailto:support@newhopewest.com" className="text-primary-600 hover:text-primary-700 text-sm">
              support@newhopewest.com
            </a>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Spiritual Guidance</h4>
            <p className="text-sm text-gray-600">
              Questions about your faith journey? Our pastoral team is here to help.
            </p>
            <a href="mailto:pastor@newhopewest.com" className="text-primary-600 hover:text-primary-700 text-sm">
              pastor@newhopewest.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPanel;